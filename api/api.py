from fastapi import FastAPI, HTTPException, Depends
from typing import List, Annotated
import api.api_models as api_models
import db.connectivity as connectivity
import db.model as model
import db.access as access
from datetime import date, datetime, timedelta
from sqlalchemy import Engine
import config
from dateutil.tz import gettz

from prometheus_fastapi_instrumentator import Instrumentator

app = FastAPI()

Instrumentator().instrument(app).expose(app)

CALIFORNIA_TIME = gettz("America/Los Angeles")

def now_timestamp():
    return datetime.now(CALIFORNIA_TIME)

@app.get("/v1/events")
def get_events(engine: Annotated[Engine, Depends(connectivity.make_db_engine)], now_timestamp: Annotated[datetime, Depends(now_timestamp)], start_date: date | None = None, end_date: date | None = None) -> api_models.EventList:
    if  (end_date == None) and (start_date != None):
        raise HTTPException(status_code=400, detail="Must specify either none or both of start_date, end_date")
    
    date_range = get_query_date_range(start_date, end_date, now_timestamp)

    db_events = access.get_events(engine, date_range)

    if start_date == None:
        db_events = filter_events_today(db_events, now_timestamp)

    return api_models.EventList(events = [to_api_event(db_event) for db_event in db_events])

def filter_events_today(db_events, now):
    now_dayseconds = now.hour * 3600 + now.minute * 60 + now.second
    yester_date = now.date() + timedelta(days = -1)

    return [
        db_event 
        for db_event in db_events
        if db_event.date != yester_date or (db_event.end_seconds and db_event.end_seconds - 24 * 60 * 60 > now_dayseconds)   
    ]

def get_query_date_range(start_date, end_date, now_timestamp) -> tuple[date,date]:
    now_range = get_now_range(now_timestamp)
    if end_date:
        return (start_date or now_range[0], end_date)
    else:
        return now_range

def get_now_range(now_timestamp) -> tuple[date, date]:
    today = now_timestamp.date()
    return (today + timedelta(days=-1), today + timedelta(days=7))

def to_api_event(db_event : model.LocalEvent) -> api_models.Event:
    return api_models.Event(
        id = db_event.id,
        date = db_event.date,
        name = db_event.name,
        type = db_event.type,
        start = to_api_time(db_event.start_seconds),
        end = to_api_time(db_event.end_seconds),
        location = db_event.location,
        address = db_event.address,
        description= db_event.description,
        cost = db_event.cost,
        link = db_event.link
    )

def to_api_time(time_seconds: int | None) -> api_models.TimeOfDay:
    if time_seconds is None:
        return None
    
    return api_models.TimeOfDay(
        hour=int(time_seconds/(60*60)),
        minute=int((time_seconds % (60*60)) / 60),
        second=(time_seconds % (60))
    )

# When running locally in development, fall back to proxying to the npm react server so we can keep editing
if config.env() == config.Env.development:
    print("Configuring static directory access!")
    from .local_development_proxy import make_proxy
    app.mount("/", make_proxy("http://localhost:3000/"))