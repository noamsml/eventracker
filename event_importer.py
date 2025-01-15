from spreadsheet.decentered_spreadsheet import DecenteredSheetImporter, SheetRow
from spreadsheet.googlesheets import GoogleRetriever
import db.access as access
import db.model as model
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
        cursor = access.get_cursor(self.db_engine, cursor_date)

        importer = DecenteredSheetImporter(self.google_client, cursor - CURSOR_FUZZ)

        rows = importer.retrieve_all()

        cursor_updates = _cursor_updates(rows, cursor_date)

        with Session(self.db_engine) as session:
            access.update_cursors(session, cursor_updates)
            access.clear_events_table(session)

            for row in rows:
                db_row = _create_db_row(row)
                session.add(db_row)
            session.commit()
        
        return len(rows)

LOCATION_RE = re.compile("([A-Za-z ]+[A-Za-z])( ?\\(.*\\))?")

def _process_location(location: str) -> str:
    match = LOCATION_RE.match(location)
    if match:
        return match[1]

    return location

def _create_db_row(row: SheetRow):
    try:
        start_seconds = _parse_time(row.start_time)
        return model.LocalEvent(
            id = model.make_id(),
            sheet_row = row.row_number,
            date = _parse_date(row.date),
            name = row.name,
            type = row.type,
            location = _process_location(row.location),
            start_seconds = start_seconds,
            end_seconds = _parse_time(row.end_time, start_seconds),
            address = row.address,
            description = row.description,
            cost = row.cost,
            link = row.link
        )
    except Exception as e:
        raise Exception("Row {}: Could not parse".format(row.row_number)) from e

TIME_REGEX = re.compile("(\\d{1,2})(:(\\d{2})(:(\\d{2}))?)?( AM| PM|)")
def _parse_time(time_spec: str, start_time: int | None = None) -> int | None:
    if time_spec:
        time_spec = time_spec.strip(" ?")

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
    minutes = int(time_parsed.group(3)) if time_parsed.group(3) else 0
    seconds = int(time_parsed.group(5)) if time_parsed.group(4) else 0
    is_am = time_parsed.group(6) == " AM"
    is_pm = time_parsed.group(6) == " PM"

    if is_am and hours == 12:
        hours = 0

    if is_pm and hours != 12:
        hours += 12

    if hours < start_hours and hours < 12:
        hours += 24
    
    return hours * (60*60) + minutes * 60 + seconds
    

def _cursor_updates(rows: List[SheetRow], cursor_date: date):
    updates = {}
    
    for row in rows:
        row_date = _parse_date(row.date)
        if row_date >= cursor_date and row_date not in updates:
            updates[row_date] = row.row_number
    
    return updates

def _parse_date(sheet_date: str):
    try: 
        return datetime.strptime(sheet_date, "%m/%d/%Y").date()
    except ValueError:
        return datetime.strptime(sheet_date, "%m/%d/%y").date()