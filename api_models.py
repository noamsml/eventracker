from pydantic import BaseModel
from datetime import date
from typing import List

class TimeOfDay(BaseModel):
    hour: int # Hour, 0 to 47 (past 24 means it goes into the next day)
    minute: int
    second: int

class Event(BaseModel):
    id: str
    date: date
    name: str
    type: str
    start: TimeOfDay | None
    end: TimeOfDay | None
    location: str
    address: str
    description: str
    cost: str
    link: str | None

class EventList(BaseModel):
    events: List[Event]
