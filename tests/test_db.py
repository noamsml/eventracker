import db.db_access as db_access
import db.db_model as db_model
import db.db_connectivity as db_connectivity
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
    return db_connectivity.make_db_engine()


@pytest.fixture
def db_engine():
    engine = db_engine_for_test()
    db_model.Base.metadata.drop_all(engine)
    db_model.Base.metadata.create_all(engine)
    return engine


def test_get_update_cursors(db_engine):
    assert db_access.get_cursor(db_engine, TOMORROWS_MORROW) == 500

    with Session(db_engine) as session:
        db_access.update_cursors(session, {TOMORROWS_MORROW: 200})
        session.commit()

    assert db_access.get_cursor(db_engine, TOMORROWS_MORROW) == 200
    assert db_access.get_cursor(db_engine, NEXT_WEEK) == 500

    with Session(db_engine) as session:
        db_access.update_cursors(session, {TOMORROWS_MORROW: 210, NEXT_WEEK: 400})
        session.commit()

    assert db_access.get_cursor(db_engine, TOMORROWS_MORROW) == 210
    assert db_access.get_cursor(db_engine, NEXT_WEEK) == 400
    assert db_access.get_cursor(db_engine, YESTERDAY) == 500