from fastapi import FastAPI, HTTPException, Depends
from typing import List, Annotated
import api_models
import db_connectivity
import db_model
import db_access
from datetime import date
from sqlalchemy import Engine

app = FastAPI()

@app.get("/v1/events")
def get_events(engine: Annotated[Engine, Depends(db_connectivity.make_db_engine)], start_date: date | None = None, end_date: date | None = None) -> api_models.EventList:
    if (start_date == None) != (end_date == None):
        raise HTTPException(status_code=400, detail="Must specify either none or both of start_date, end_date")
    
    date_range = (start_date, end_date) if start_date else None

    db_events = db_access.get_events(engine, date_range)

    return api_models.EventList(events = [to_api_event(db_event) for db_event in db_events])


def to_api_event(db_event : db_model.LocalEvent) -> api_models.Event:
    return api_models.Event(
        id = db_event.id,
        date = db_event.date,
        name = db_event.name,
        type = db_event.type,
        start = to_api_time(db_event.start_seconds),
        end = to_api_time(db_event.end_seconds),
        location = db_event.location,
        address = db_event.address,
        description= db_event.description,
        cost = db_event.cost,
        link = db_event.link
    )

def to_api_time(time_seconds: int | None) -> api_models.TimeOfDay:
    if time_seconds is None:
        return None
    
    return api_models.TimeOfDay(
        hour=int(time_seconds/(60*60)),
        minute=int((time_seconds % (60*60)) / 60),
        second=(time_seconds % (60))
    )