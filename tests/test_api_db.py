from api import api
import db.model as model
import db.connectivity as connectivity
from datetime import date, timedelta, datetime, time
import pytest
from sqlalchemy import Engine
from sqlalchemy.orm import Session
from config import Env
import config
import feedparser

from fastapi.testclient import TestClient

TOMORROWS_MORROW = date.today() + timedelta(days=2)
PAST_EVENT = date.today() + timedelta(days=-2)
YESTERDAY = date.today() + timedelta(days=-1)
NEXT_WEEK = date.today() + timedelta(days=7)
TWO_WEEKS_HENCE = date.today() + timedelta(days=14)

SHEET_ROW = 5
EVENT_NAME = "Name"
TYPE = "Party"
LOCATION = "Oakland"
LINK =  "http://link"
EVENT_DESCRIPTION = "description"
EVENT_ADDRESS = "address"
EVENT_COST="$5"

config.force_override_env = Env.test

def create_sample_event(event_date: date, engine: Engine, start_seconds: int =  60*60*16, end_seconds: int = 60*60*26 + 30*60) -> str:
    id = model.make_id()
    with Session(engine) as session:
        event = model.LocalEvent(
            id = id,
            sheet_row = SHEET_ROW,
            name = EVENT_NAME,
            date = event_date,
            start_seconds = start_seconds,
            end_seconds = end_seconds,
            type = TYPE,
            location = LOCATION,
            address=EVENT_ADDRESS,
            description = EVENT_DESCRIPTION,
            cost= EVENT_COST,
            link = LINK
        )
        session.add(event)
        session.commit()
    return id

@pytest.fixture
def api_tester():
    return TestClient(api.app)

def db_engine_for_test():
    return connectivity.make_db_engine()

def time_for_test():
    d = date.today()
    return datetime(d.year, d.month, d.day, 1, 30)

api.app.dependency_overrides[connectivity.make_db_engine] = db_engine_for_test 
api.app.dependency_overrides[api.now_timestamp] = time_for_test 

@pytest.fixture
def db_engine():
    engine = db_engine_for_test()
    model.Base.metadata.drop_all(engine)
    model.Base.metadata.create_all(engine)
    return engine

def test_api_basic(db_engine, api_tester):
    event_id = create_sample_event(TOMORROWS_MORROW, db_engine)
    response = api_tester.get("/v1/events")
    assert response.status_code == 200

    response_json = response.json()

    assert len(response_json['events']) == 1

    assert response_json['events'][0]['id'] == event_id
    assert response_json['events'][0]['name'] == EVENT_NAME
    assert response_json['events'][0]['date'] == TOMORROWS_MORROW.isoformat()
    assert response_json['events'][0]['start']['hour'] == 16
    assert response_json['events'][0]['start']['minute'] == 0
    assert response_json['events'][0]['start']['second'] == 0
    assert response_json['events'][0]['end']['hour'] == 26
    assert response_json['events'][0]['end']['minute'] == 30
    assert response_json['events'][0]['end']['second'] == 0
    assert response_json['events'][0]['type'] == TYPE
    assert response_json['events'][0]['location'] == LOCATION
    assert response_json['events'][0]['address'] == EVENT_ADDRESS
    assert response_json['events'][0]['description'] == EVENT_DESCRIPTION
    assert response_json['events'][0]['cost'] == EVENT_COST
    assert response_json['events'][0]['link'] == LINK

def test_api_hide_expired(db_engine, api_tester):
    id = create_sample_event(PAST_EVENT, db_engine)
    response = api_tester.get("/v1/events")
    assert response.status_code == 200

    response_json = response.json()

    assert len(response_json['events']) == 0

def test_api_show_today(db_engine, api_tester):
    id = create_sample_event(date.today(), db_engine)
    response = api_tester.get("/v1/events")
    assert response.status_code == 200

    response_json = response.json()

    assert len(response_json['events']) == 1
    assert set([ev['id'] for ev in response_json['events']]) == {id}

def test_api_show_yesterday_spillover(db_engine, api_tester):
    id_nosplillover = create_sample_event(YESTERDAY, db_engine, end_seconds=17 * 60 * 60)
    id_notquitespillover = create_sample_event(YESTERDAY, db_engine, end_seconds=25 * 60 * 60)
    id_spillover = create_sample_event(YESTERDAY, db_engine, end_seconds=28 * 60 * 60)
    response = api_tester.get("/v1/events")
    assert response.status_code == 200

    response_json = response.json()

    assert len(response_json['events']) == 1
    assert set([ev['id'] for ev in response_json['events']]) == {id_spillover}

def test_api_custom_time_range(db_engine, api_tester):
    id_yesterday = create_sample_event(PAST_EVENT, db_engine)
    id_tomorrowsmorrow = create_sample_event(TOMORROWS_MORROW, db_engine)
    id_next_week = create_sample_event(NEXT_WEEK, db_engine)
    response = api_tester.get("/v1/events?start_date={}&end_date={}".format(PAST_EVENT.isoformat(), TOMORROWS_MORROW.isoformat()))
    assert response.status_code == 200

    response_json = response.json()

    assert len(response_json['events']) == 2
    assert set([ev['id'] for ev in response_json['events']]) == {id_yesterday, id_tomorrowsmorrow}

def test_api_only_end_date(db_engine, api_tester):
    id_yesterday = create_sample_event(YESTERDAY, db_engine, end_seconds=28*60*60)
    id_two_weeks_hence = create_sample_event(TOMORROWS_MORROW, db_engine)
    id_past = create_sample_event(PAST_EVENT, db_engine)
    response = api_tester.get("/v1/events?end_date={}".format(TWO_WEEKS_HENCE.isoformat()))
    assert response.status_code == 200

    response_json = response.json()

    assert len(response_json['events']) == 2
    assert set([ev['id'] for ev in response_json['events']]) == {id_yesterday, id_two_weeks_hence}

def test_api_only_end_date_no_times(db_engine, api_tester):
    id_yesterday = create_sample_event(YESTERDAY, db_engine, start_seconds=None, end_seconds=None)
    id_two_weeks_hence = create_sample_event(TOMORROWS_MORROW, db_engine)
    id_past = create_sample_event(PAST_EVENT, db_engine)
    response = api_tester.get("/v1/events?end_date={}".format(TWO_WEEKS_HENCE.isoformat()))
    assert response.status_code == 200

    response_json = response.json()

    assert len(response_json['events']) == 1
    assert set([ev['id'] for ev in response_json['events']]) == {id_two_weeks_hence}

def test_atom(db_engine, api_tester):
    id_tomorrowsmorrow = create_sample_event(TOMORROWS_MORROW, db_engine)

    response = api_tester.get("/feeds/atom.xml")
    assert response.status_code == 200
    assert response.headers["Content-Type"] == "application/atom+xml"

    parsed = feedparser.parse(response.read())

    assert len(parsed['entries']) == 1
    entry = parsed['entries'][0]

    assert entry['link'] == "http://link"
    assert entry['title'] == "Name"
    assert datetime.fromisoformat(entry['published']).date() == TOMORROWS_MORROW
    assert datetime.fromisoformat(entry['published']).time() == time(16, 0)
    assert entry['summary'] == "description <br /> <br />\nLocation: Oakland <br />\nAddress: address <br />\nHours: 04:00 PM - 02:30 AM"
    
def test_rss(db_engine, api_tester):
    id_tomorrowsmorrow = create_sample_event(TOMORROWS_MORROW, db_engine)

    response = api_tester.get("/feeds/rss.xml")
    assert response.status_code == 200
    assert response.headers["Content-Type"] == "application/rss+xml"

    parsed = feedparser.parse(response.read())

    assert len(parsed['entries']) == 1
    entry = parsed['entries'][0]

    assert entry['link'] == "http://link"
    assert entry['title'] == "Name"
    # TODO checking the published date and time for RSS feeds -- but I am lazy and the atom test verifies the same thing
    assert entry['summary'] == "description <br /> <br />\nLocation: Oakland <br />\nAddress: address <br />\nHours: 04:00 PM - 02:30 AM"

def test_api_cors_header(db_engine, api_tester):
    response = api_tester.get("/v1/events")
    assert response.status_code == 200
    assert response.headers["Access-Control-Allow-Origin"] == "*"