import api
import db_model
import db_connectivity
from datetime import date, timedelta
import pytest
from sqlalchemy import Engine
from sqlalchemy.orm import Session
from config import Env

from fastapi.testclient import TestClient

TOMORROWS_MORROW = date.today() + timedelta(days=2)
YESTERDAY = date.today() + timedelta(days=-1)
NEXT_WEEK = date.today() + timedelta(days=7)

SHEET_ROW = 5
EVENT_NAME = "Name"
TYPE = "Party"
LOCATION = "Oakland"
LINK =  "http://link"
EVENT_DESCRIPTION = "description"
EVENT_ADDRESS = "address"
EVENT_COST="$5"

def create_sample_event(event_date: date, engine: Engine) -> str:
    id = db_model.make_id()
    with Session(engine) as session:
        event = db_model.LocalEvent(
            id = id,
            sheet_row = SHEET_ROW,
            name = EVENT_NAME,
            date = event_date,
            start_seconds = 60*60*16,
            end_seconds = 60*60*26 + 30*60,
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
    return db_connectivity.make_db_engine(force_env=Env.test)

api.app.dependency_overrides[db_connectivity.make_db_engine] = db_engine_for_test 

@pytest.fixture
def db_engine():
    engine = db_engine_for_test()
    db_model.Base.metadata.drop_all(engine)
    db_model.Base.metadata.create_all(engine)
    return engine

def test_api_basic(db_engine, api_tester):
    id = create_sample_event(TOMORROWS_MORROW, db_engine)
    response = api_tester.get("/v1/events")
    assert response.status_code == 200

    response_json = response.json()

    assert len(response_json['events']) == 1

    assert response_json['events'][0]['id'] == id
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
    id = create_sample_event(YESTERDAY, db_engine)
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

def test_api_custom_time_range(db_engine, api_tester):
    id_yesterday = create_sample_event(YESTERDAY, db_engine)
    id_tomorrowsmorrow = create_sample_event(TOMORROWS_MORROW, db_engine)
    id_next_week = create_sample_event(NEXT_WEEK, db_engine)
    response = api_tester.get("/v1/events?start_date={}&end_date={}".format(YESTERDAY.isoformat(), TOMORROWS_MORROW.isoformat()))
    assert response.status_code == 200

    response_json = response.json()

    assert len(response_json['events']) == 2
    assert set([ev['id'] for ev in response_json['events']]) == {id_yesterday, id_tomorrowsmorrow}