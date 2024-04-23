from decentered_spreadsheet import DecenteredSheetImporter, SheetRow
from googlesheets import GoogleRetriever
import db_access
import db_model
from sqlalchemy import Engine
from sqlalchemy.orm import Session
from datetime import date, datetime
from typing import List
import re

CURSOR_FUZZ = 10

class EventImporter:
    def __init__(self, google_client: GoogleRetriever, db_engine: Engine):
        self.google_client = google_client
        self.db_engine = db_engine
    def perform_import(self, cursor_date: date | None = None):
        cursor_date = cursor_date or date.today()
        cursor = db_access.get_cursor(self.db_engine, cursor_date)

        importer = DecenteredSheetImporter(self.google_client, cursor - CURSOR_FUZZ)

        rows = importer.retrieve_all()

        cursor_updates = _cursor_updates(rows, cursor_date)

        with Session(self.db_engine) as session:
            db_access.update_cursors(session, cursor_updates)
            db_access.clear_events_table(session)

            for row in rows:
                db_row = _create_db_row(row)
                session.add(db_row)
            session.commit()
        
        return len(rows)

def _create_db_row(row: SheetRow):
    start_seconds = _parse_time(row.start_time)
    return db_model.LocalEvent(
        id = db_model.make_id(),
        sheet_row = row.row_number,
        date = _parse_date(row.date),
        name = row.name,
        type = row.type,
        location = row.location,
        start_seconds = start_seconds,
        end_seconds = _parse_time(row.end_time, start_seconds),
        address = row.address,
        description = row.description,
        cost = row.cost,
        link = row.link
    )

TIME_REGEX = re.compile("(\\d{1,2}):(\\d{2}):(\\d{2}) (AM|PM)")
def _parse_time(time_spec: str, start_time: int | None = None) -> int | None:
    if not time_spec or not time_spec.strip():
        return None

    time_parsed = TIME_REGEX.match(time_spec)
    # So eventually we should be resillient to badly formatted times, but I'd rather start erring on this side
    if not time_parsed:
        raise Exception("Could not parse time {}".format(time_spec))
    
    if start_time:
        start_hours = int(start_time / (60*60))
    else:
        start_hours = 0
    
    hours =  int(time_parsed.group(1))
    minutes = int(time_parsed.group(2))
    seconds = int(time_parsed.group(3))
    is_am = time_parsed.group(4) == "AM"

    if is_am and hours == 12:
        hours = 0

    if is_am and hours < start_hours:
        hours += 24
    elif not is_am and hours != 12:
        hours += 12
    
    return hours * (60*60) + minutes * 60 + seconds
    

def _cursor_updates(rows: List[SheetRow], cursor_date: date):
    updates = {}
    
    for row in rows:
        row_date = _parse_date(row.date)
        if row_date >= cursor_date and row_date not in updates:
            updates[row_date] = row.row_number
    
    return updates

def _parse_date(sheet_date: str):
    return datetime.strptime(sheet_date, "%m/%d/%Y").date()