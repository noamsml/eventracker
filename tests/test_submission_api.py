from api import api
import db.model as model
import db.connectivity as connectivity
from datetime import date, timedelta, datetime
import pytest
from sqlalchemy import Engine
from sqlalchemy.orm import Session
from config import Env
import config

from fastapi.testclient import TestClient


config.force_override_env = Env.test

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

