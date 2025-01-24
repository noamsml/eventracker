from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from datetime import date, datetime
import uuid

import sqlalchemy

from typing import Annotated

short_str = Annotated[str, 32]
medium_str = Annotated[str, 128]
long_str = Annotated[str, 1024]
longest_str = Annotated[str, 9001]

def make_id():
    return str(uuid.uuid4())

class Base(DeclarativeBase):
    type_annotation_map = {
        short_str: sqlalchemy.String(length=32),
        medium_str: sqlalchemy.String(length=128),
        long_str: sqlalchemy.String(length=1024),
        longest_str: sqlalchemy.Text
    }

class LocalEvent(Base):
    __tablename__ = "events"

    # Use uuid for now -- figure out best id schema later
    id: Mapped[medium_str] = mapped_column(primary_key=True)
    date: Mapped[date]
    sheet_row: Mapped[int]
    name: Mapped[long_str]
    # After some thought -- best to keep design simple/dumb by persisting strings for now
    # can revisit/re-ingest by turning values to enumerated numbers, but realistically
    # there is no server side logic that needs to touch the event type or location,
    # and keeping these as strings improves ingestion flexibility.
    type: Mapped[short_str]
    location: Mapped[short_str]
    # Should I store these as full dates?
    start_seconds: Mapped[int | None] # Seconds in the day (from 0 for 12 AM to 60 * 60 * 24 - 1 for 11:59 PM)
    end_seconds: Mapped[int | None] # Seconds in the day (from 0 for 12 AM to 60 * 60 * 48 - 1 for 11:59 PM the next day)
    address: Mapped[long_str]
    description: Mapped[longest_str]
    cost: Mapped[long_str]
    link: Mapped[long_str]

class EventSubmission(Base):
    __tablename__ = "submissions"

    # Use uuid for now -- figure out best id schema later
    id: Mapped[medium_str] = mapped_column(primary_key=True)
    date_submitted: Mapped[date]
    submitter_name: Mapped[long_str]
    name: Mapped[long_str]
    # Trying to decide if we should do something fancier here for the event side
    type: Mapped[short_str]
    location: Mapped[short_str]
    # Dates/times expressed in terms of JSON structure
    # to allow mass approval of events
    dates_and_times: Mapped[longest_str]
    address: Mapped[long_str]
    description: Mapped[longest_str]
    cost: Mapped[long_str]
    link: Mapped[long_str]

class AdminUserSession(Base):
    __tablename__ = "admin_user_sessions"

    # Use UUIDs
    id: Mapped[medium_str] = mapped_column(primary_key=True)
    # Google credentials encoded as JSON
    refresh_credentials: Mapped[longest_str]



# Technically this is most likely a unary value, but storing it in a file or whatever is bad practice
# so this is a table with one-ish row
class Cursor(Base):
    __tablename__ = "cursors"

    cursor_date: Mapped[date] = mapped_column(primary_key=True)
    value: Mapped[int]