from pydantic import BaseModel
from datetime import date as date_type
from typing import List
from pydantic import Field


class TimeOfDay(BaseModel):
    """
    Reperesents a time of the day in Pacific Time. May represent a time in the following day.
    """

    """
    Hour, 0 to 47 (past 24 means it goes into the next day)
    """
    hour: int

    """
    Minute, 0 to 59
    """
    minute: int

    """
    Second, 0 to 59
    """
    second: int


class Event(BaseModel):
    """
    An event, such as party, concert or gallery opening.
    """

    id: str = Field(description="The unique identifier for the event.")
    date: date_type = Field(
        description="The date of the event. Represented as YYYY-MM-DD."
    )
    name: str = Field(description="The name or title of the event.")
    type: str = Field(
        description="The type of the event. One of: Party, Show, Art, Music, Theater, etc. Validation is not strict so there may be other similar values."
    )

    start: TimeOfDay | None = Field(
        description="The start time of the event. May be None if the event is all day."
    )
    end: TimeOfDay | None = Field(
        description="The end time of the event. May be None if the event is all day or if the end time is not known."
    )
    location: str = Field(
        description='The location in the bay area of the event. May be "San Francisco", "Oakland", "East Bay", "South Bay", "North Bay" or "Out of Town". Validation is not strict so there may be other similar values.'
    )
    address: str = Field(
        description="The address of the event. Validation is not strict so this may not be a valid address."
    )
    description: str = Field(description="The description of the event.")
    cost: str = Field(
        description='The cost of the event as a free-form string. May be a price, "free", "donation" or a more complex description.'
    )
    link: str | None = Field(
        description="The link to the event. May be a website, a Facebook event, a Google Calendar event, etc. Validation is not strict so this may not be a valid URL."
    )


class EventDateTime(BaseModel):
    date: date_type
    start: TimeOfDay | None
    end: TimeOfDay | None


class EventSubmission(BaseModel):
    id: str | None = None
    date_submitted: date_type
    submitter_name: str
    name: str
    type: str
    dates_times: List[EventDateTime]
    location: str
    address: str
    description: str
    cost: str
    link: str | None


class EventList(BaseModel):
    events: List[Event]
