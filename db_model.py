from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from datetime import date
import uuid

import sqlalchemy

from typing import Annotated

short_str = Annotated[str, 32]
medium_str = Annotated[str, 128]
long_str = Annotated[str, 512]

def make_id():
    return str(uuid.uuid4())

class Base(DeclarativeBase):
    type_annotation_map = {
        short_str: sqlalchemy.String(length=32),
        medium_str: sqlalchemy.String(length=128),
        long_str: sqlalchemy.String(length=512)
    }

class LocalEvent(Base):
    __tablename__ = "events"

    # Use uuid for now -- figure out best id schema later
    id: Mapped[medium_str] = mapped_column(primary_key=True)
    date: Mapped[date]
    sheet_row: Mapped[int]
    name: Mapped[medium_str]
    # After some thought -- best to keep design simple/dumb by persisting strings for now
    # can revisit/re-ingest by turning values to enumerated numbers, but realistically
    # there is no server side logic that needs to touch the event type or location,
    # and keeping these as strings improves ingestion flexibility.
    type: Mapped[short_str]
    location: Mapped[short_str]
    # Should I store these as full dates?
    start_seconds: Mapped[int | None] # Seconds in the day (from 0 for 12 AM to 60 * 60 * 24 - 1 for 11:59 PM)
    end_seconds: Mapped[int | None] # Seconds in the day (from 0 for 12 AM to 60 * 60 * 48 - 1 for 11:59 PM the next day)
    address: Mapped[medium_str]
    description: Mapped[long_str]
    cost: Mapped[medium_str]
    link: Mapped[long_str]