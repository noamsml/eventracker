from sqlalchemy import Engine, select
from sqlalchemy.orm import Session
from datetime import date
from typing import List
import db_model


def get_events(engine: Engine, date_range: tuple[date, date] | None) -> List[db_model.LocalEvent]:
    with Session(engine) as session:
        if date_range:
            return session.scalars(
                select(db_model.LocalEvent).where(
                    (db_model.LocalEvent.date >= date_range[0])
                    & (db_model.LocalEvent.date <= date_range[1])
                )
            ).all()
        else:
            values = session.scalars(
                select(db_model.LocalEvent).where(db_model.LocalEvent.date >= date.today())
            ).all()
            return values