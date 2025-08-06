from fastapi import FastAPI, HTTPException, Depends, Response
from typing import List, Annotated
import api.api_models as api_models
import db.connectivity as connectivity
import db.model as model
import db.access as access
from datetime import date, datetime, timedelta, time
from sqlalchemy import Engine
import config
from dateutil.tz import gettz
from prometheus_client import Gauge
from feedgen.feed import FeedGenerator
from textwrap import dedent
from fastapi.middleware.cors import CORSMiddleware
import submissions.converter
import submissions.admin

from prometheus_fastapi_instrumentator import Instrumentator

app = FastAPI()

Instrumentator().instrument(app).expose(app)

CALIFORNIA_TIME = gettz("America/Los Angeles")

RETURNED_EVENT_COUNT = Gauge(
    "decentered_returned_events", "Returned events for decentered"
)


def now_timestamp():
    return datetime.now(CALIFORNIA_TIME)


@app.get("/v1/events")
def get_events(
    engine: Annotated[Engine, Depends(connectivity.make_db_engine)],
    now_timestamp: Annotated[datetime, Depends(now_timestamp)],
    response: Response,
    start_date: date | None = None,
    end_date: date | None = None,
) -> api_models.EventList:
    if (end_date == None) and (start_date != None):
        raise HTTPException(
            status_code=400,
            detail="Must specify either none or both of start_date, end_date",
        )

    db_events = get_events_internal(engine, now_timestamp, start_date, end_date)

    response.headers["Access-Control-Allow-Origin"] = "*"
    return api_models.EventList(
        events=[to_api_event(db_event) for db_event in db_events]
    )


# Endpoint exists to separate the liveness probe traffic from real traffic
@app.get("/v1/events_synthetic")
def get_events_synethic(
    engine: Annotated[Engine, Depends(connectivity.make_db_engine)],
    now_timestamp: Annotated[datetime, Depends(now_timestamp)],
    response: Response
) -> api_models.EventList:
    return get_events(engine, now_timestamp, response)

def get_events_internal(
    engine: Engine,
    now_timestamp: datetime,
    start_date: date | None = None,
    end_date: date | None = None,
):
    date_range = get_query_date_range(start_date, end_date, now_timestamp)

    db_events = access.get_events(engine, date_range)

    if start_date == None:
        db_events = filter_events_today(db_events, now_timestamp)

    if start_date == None and (end_date == None or end_date > date.today() + timedelta(days=14)):
        RETURNED_EVENT_COUNT.set(len(db_events))

    return db_events


def make_feed_description(event: model.LocalEvent):
    return dedent("""\
    {description} <br /> <br />
    Location: {location} <br />
    Address: {address} <br />
    Hours: {start} - {end}
""").format(
        description=event.description,
        location=event.location,
        address=event.address,
        start=to_time(event.start_seconds),
        end=to_time(event.end_seconds),
    )


def get_feed_generator(engine: Engine, now_timestamp: datetime, id: str) -> FeedGenerator:
    db_events = get_events_internal(engine, now_timestamp)

    fg = FeedGenerator()
    fg.title("Decentered Eventracker")
    fg.id(id)
    fg.link({"href": "https://events.decentered.org/"})
    fg.description("Tracker for events around the bay area!")

    for event in db_events:
        feed_entry = fg.add_entry()
        feed_entry.title(event.name)
        feed_entry.description(make_feed_description(event))
        feed_entry.published(
            datetime.combine(event.date, to_time_obj(event.start_seconds), tzinfo=CALIFORNIA_TIME)
        )
        feed_entry.id("https://events.decentered.org/events/{}".format(event.sheet_row))
        if event.link:
            feed_entry.link({"href": event.link, "title": "Event link"})
    return fg


@app.get("/feeds/atom.xml")
def get_events_feed(
    engine: Annotated[Engine, Depends(connectivity.make_db_engine)],
    now_timestamp: Annotated[datetime, Depends(now_timestamp)],
):
    fg = get_feed_generator(engine, now_timestamp, "https://events.decentered.org/feed/atom.xml")

    return Response(content=fg.atom_str(), media_type="application/atom+xml")


@app.get("/feeds/rss.xml")
def get_events_feed(
    engine: Annotated[Engine, Depends(connectivity.make_db_engine)],
    now_timestamp: Annotated[datetime, Depends(now_timestamp)],
):
    fg = get_feed_generator(engine, now_timestamp, "https://events.decentered.org/feed/rss.xml")

    return Response(content=fg.rss_str(), media_type="application/rss+xml")


@app.post("/v1/submit")
def post_submission(engine: Annotated[Engine, Depends(connectivity.make_db_engine)], now_timestamp: Annotated[datetime, Depends(now_timestamp)], event_submission: api_models.EventSubmission):
    validate_submission(event_submission, now_timestamp)

    access.persist_submission(engine, submissions.converter.convert_submission(event_submission))
    return { "success": True }

def validate_submission(event_submission: api_models.EventSubmission, now_timestamp: datetime):
    if event_submission.id != None:
        raise HTTPException(status_code=400, detail="Unknown field 'id'")

    if len(event_submission.dates_times) == 0:
        raise HTTPException(status_code=400, detail="No dates or times specified")

    for date_time in event_submission.dates_times:
        if date_time.date < now_timestamp:
            raise HTTPException(status_code=400, detail="Date {} is in the past!".formate(date_time.date))

def filter_events_today(db_events, now):
    now_dayseconds = now.hour * 3600 + now.minute * 60 + now.second
    yester_date = now.date() + timedelta(days=-1)

    return [
        db_event
        for db_event in db_events
        if db_event.date != yester_date
        or (
            db_event.end_seconds
            and db_event.end_seconds - 24 * 60 * 60 > now_dayseconds
        )
    ]


def get_query_date_range(start_date, end_date, now_timestamp) -> tuple[date, date]:
    now_range = get_now_range(now_timestamp)
    if end_date:
        return (start_date or now_range[0], end_date)
    else:
        return now_range


def get_now_range(now_timestamp) -> tuple[date, date]:
    today = now_timestamp.date()
    return (today + timedelta(days=-1), today + timedelta(days=7))


def to_api_event(db_event: model.LocalEvent) -> api_models.Event:
    return api_models.Event(
        id=db_event.id,
        date=db_event.date,
        name=db_event.name,
        type=db_event.type,
        start=to_api_time(db_event.start_seconds),
        end=to_api_time(db_event.end_seconds),
        location=db_event.location,
        address=db_event.address,
        description=db_event.description,
        cost=db_event.cost,
        link=db_event.link,
    )


def to_api_time(time_seconds: int | None) -> api_models.TimeOfDay:
    if time_seconds is None:
        return None

    return api_models.TimeOfDay(
        hour=int(time_seconds / (60 * 60)),
        minute=int((time_seconds % (60 * 60)) / 60),
        second=(time_seconds % (60)),
    )


def to_time_obj(time_seconds: int | None) -> time:
    api_time = to_api_time(time_seconds)

    if api_time is None:
        return time(0, 0)

    return time(api_time.hour, api_time.minute, api_time.second, tzinfo=CALIFORNIA_TIME)


def to_time(time_seconds: int | None) -> str:
    api_time = to_api_time(time_seconds)

    if api_time is None:
        return ""

    time_part = "{:02}:{:02}".format(api_time.hour % 12, api_time.minute)

    if api_time.second:
        time_part = "{}:{:02}".format(time_part, api_time.second)

    is_am = (api_time.hour // 12) % 2 == 0

    return "{} {}".format(time_part, "AM" if is_am else "PM")


# When running locally in development, fall back to proxying to the npm react server so we can keep editing
if config.env() == config.Env.development:
    print("Configuring static directory access!")
    from .local_development_proxy import make_proxy

    app.mount("/", make_proxy("http://localhost:3000/"))


app.mount("/submission/", submissions.admin.app)