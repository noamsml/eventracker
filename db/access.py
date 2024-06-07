from sqlalchemy import Engine, select, delete
from sqlalchemy.orm import Session
from datetime import date, datetime, timedelta
from dateutil.tz import gettz
from typing import List, Dict
import db.model as model
import config

# Misc functions to talk with the db -- at some point I should reorg these to live in model-specific classes and
# all take a Session but I'm trying to get this whole thing done first

CALIFORNIA_TIME = gettz("America/Los Angeles")

def get_events(
    engine: Engine, date_range: tuple[date, date] | None
) -> List[model.LocalEvent]:
    date_range = date_range or get_now_range()
    with Session(engine) as session:
        return session.scalars(
            select(model.LocalEvent).where(
                (model.LocalEvent.date >= date_range[0])
                & (model.LocalEvent.date <= date_range[1])
            ).order_by(model.LocalEvent.date.asc())
        ).all()

def get_now_range() -> tuple[date, date]:
    today = datetime.now(CALIFORNIA_TIME).date()
    return [today, today + timedelta(days=7)]

def get_cursor(engine: Engine, cursor_date: date) -> int:
    with Session(engine) as session:
        return get_cursor_in_session(session, cursor_date)

def get_cursor_in_session(session: Session, cursor_date: date) -> int:
    maybe_cursor = session.scalars(
        select(model.Cursor).where(model.Cursor.cursor_date == cursor_date)
    ).one_or_none()

    if not maybe_cursor:
        return config.config().base_row

    return maybe_cursor.value

def update_cursors(session: Session, cursor_map: Dict[date, int]):
    cursors_to_update = session.scalars(
        select(model.Cursor).where(
            model.Cursor.cursor_date.in_(cursor_map.keys())
        )
    ).all()

    cursors_to_update_map = {cursor.cursor_date: cursor for cursor in cursors_to_update}

    for cursor_date, value in cursor_map.items():
        if cursor_date in cursors_to_update_map:
            cursors_to_update_map[cursor_date].value = value
        else:
            new_cursor = model.Cursor(cursor_date=cursor_date, value=value)
            session.add(new_cursor)

def clear_events_table(session: Session):
    session.execute(delete(model.LocalEvent))