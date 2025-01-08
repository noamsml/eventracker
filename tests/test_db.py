import db.access as access
import db.model as model
import db.connectivity as connectivity
from datetime import date, timedelta
import pytest
from sqlalchemy import Engine
from sqlalchemy.orm import Session
from config import Env
import config

TOMORROWS_MORROW = date.today() + timedelta(days=2)
YESTERDAY = date.today() + timedelta(days=-1)
NEXT_WEEK = date.today() + timedelta(days=7)

config.force_override_env = Env.test


def db_engine_for_test():
    return connectivity.make_db_engine()


@pytest.fixture
def db_engine():
    engine = db_engine_for_test()
    model.Base.metadata.drop_all(engine)
    model.Base.metadata.create_all(engine)
    return engine


def test_get_update_cursors(db_engine):
    assert access.get_cursor(db_engine, TOMORROWS_MORROW) == 500

    with Session(db_engine) as session:
        access.update_cursors(session, {TOMORROWS_MORROW: 200})
        session.commit()

    assert access.get_cursor(db_engine, TOMORROWS_MORROW) == 200
    assert access.get_cursor(db_engine, YESTERDAY) == 500

    with Session(db_engine) as session:
        access.update_cursors(session, {TOMORROWS_MORROW: 210, NEXT_WEEK: 400})
        session.commit()

    assert access.get_cursor(db_engine, TOMORROWS_MORROW) == 210
    assert access.get_cursor(db_engine, NEXT_WEEK) == 400
    assert access.get_cursor(db_engine, YESTERDAY) == 500

def test_get_update_cursors_with_gap(db_engine):
    with Session(db_engine) as session:
        access.update_cursors(session, {YESTERDAY: 2000, NEXT_WEEK: 2200})
        session.commit()

    assert access.get_cursor(db_engine, YESTERDAY) == 2000
    assert access.get_cursor(db_engine, TOMORROWS_MORROW) == 2000
    assert access.get_cursor(db_engine, NEXT_WEEK) == 2200
