import db_model
import db_connectivity
import db_access
from datetime import date, timedelta
import pytest
from sqlalchemy import Engine
from sqlalchemy.orm import Session
from config import Env
import config
from decentered_spreadsheet import DecenteredSheetImporter
from googlesheets import GoogleRetriever
from unittest.mock import MagicMock
from event_importer import EventImporter

config.force_override_env = Env.test


def db_engine_for_test():
    return db_connectivity.make_db_engine()

@pytest.fixture
def db_engine():
    engine = db_engine_for_test()
    db_model.Base.metadata.drop_all(engine)
    db_model.Base.metadata.create_all(engine)
    return engine

def test_retrieve_basic(db_engine):
    retrieve_return = [
        [490, "04/22/2024", "Decentered open mic", "Open Mic", "06:00:00 PM", "09:00:00 PM", "San Francisco", "The Center SF", "It's open mic", "Free", "https://decentered.org"],
        [491, "04/23/2024", "Late night jams", "Party", "10:00:00 PM", "04:00:00 AM", "Oakland", "Mother Tongue", "Come jam with us", "$15", "https://noam.horse"]
    ]
    # This is technically wrong typing -- maybe extract interface later?
    google_retriever_mock = GoogleRetriever(None, None)
    google_retriever_mock.retrieve_spreadsheet_range = MagicMock(return_value = retrieve_return)

    event_importer = EventImporter(google_retriever_mock, db_engine)

    event_importer.perform_import(date(2024, 4, 22))
    google_retriever_mock.retrieve_spreadsheet_range.assert_called_once_with((1,10), (490, 590))

    assert 490 == db_access.get_cursor(db_engine, date(2024, 4, 22))
    assert 491 == db_access.get_cursor(db_engine, date(2024, 4, 23))

    stored_values = db_access.get_events(db_engine, (date(2024, 4, 20), date(2024, 4, 30)))

    assert ["Decentered open mic", "Late night jams"] == [event.name for event in stored_values]
    assert ["Open Mic", "Party"] == [event.type for event in stored_values]
    assert [18 * 60 * 60, 22 * 60 * 60] == [event.start_seconds for event in stored_values]
    assert [21 * 60 * 60, 28 * 60 * 60] == [event.end_seconds for event in stored_values]
    assert ["San Francisco", "Oakland"] == [event.location for event in stored_values]
    assert ["The Center SF", "Mother Tongue"] == [event.address for event in stored_values]
    assert ["It's open mic", "Come jam with us"] == [event.description for event in stored_values]
    assert ["Free", "$15"] == [event.cost for event in stored_values]
    assert ["https://decentered.org", "https://noam.horse"] == [event.link for event in stored_values]


def test_retrieve_get_todays_cursor(db_engine):
    with Session(db_engine) as session:
        db_access.update_cursors(session, {date(2024, 4, 20): 2000})
        session.commit()

    # This is technically wrong typing -- maybe extract interface later?
    google_retriever_mock = GoogleRetriever(None, None)
    google_retriever_mock.retrieve_spreadsheet_range = MagicMock(return_value = [])

    event_importer = EventImporter(google_retriever_mock, db_engine)

    event_importer.perform_import(date(2024, 4, 20))
    google_retriever_mock.retrieve_spreadsheet_range.assert_called_once_with((1,10), (1990, 2090))


    