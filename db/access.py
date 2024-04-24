from sqlalchemy import Engine, select, delete
from sqlalchemy.orm import Session
from datetime import date, datetime
from typing import List, Dict
import db.db_model as db_model
import config

# Misc functions to talk with the db -- at some point I should reorg these to live in model-specific classes and
# all take a Session but I'm trying to get this whole thing done first

def get_events(
    engine: Engine, date_range: tuple[date, date] | None
) -> List[db_model.LocalEvent]:
    with Session(engine) as session:
        if date_range:
            return session.scalars(
                select(db_model.LocalEvent).where(
                    (db_model.LocalEvent.date >= date_range[0])
                    & (db_model.LocalEvent.date <= date_range[1])
                ).order_by(db_model.LocalEvent.date.asc())
            ).all()
        else:
            values = session.scalars(
                select(db_model.LocalEvent).where(
                    db_model.LocalEvent.date >= date.today()
                ).order_by(db_model.LocalEvent.date.asc())
            ).all()
            return values


def get_cursor(engine: Engine, cursor_date: date) -> int:
    with Session(engine) as session:
        return get_cursor_in_session(session, cursor_date)

def get_cursor_in_session(session: Session, cursor_date: date) -> int:
    maybe_cursor = session.scalars(
        select(db_model.Cursor).where(db_model.Cursor.cursor_date == cursor_date)
    ).one_or_none()

    if not maybe_cursor:
        return config.config().base_row

    return maybe_cursor.value

def update_cursors(session: Session, cursor_map: Dict[date, int]):
    cursors_to_update = session.scalars(
        select(db_model.Cursor).where(
            db_model.Cursor.cursor_date.in_(cursor_map.keys())
        )
    ).all()

    cursors_to_update_map = {cursor.cursor_date: cursor for cursor in cursors_to_update}

    for cursor_date, value in cursor_map.items():
        if cursor_date in cursors_to_update_map:
            cursors_to_update_map[cursor_date].value = value
        else:
            new_cursor = db_model.Cursor(cursor_date=cursor_date, value=value)
            session.add(new_cursor)

def clear_events_table(session: Session):
    session.execute(delete(db_model.LocalEvent))