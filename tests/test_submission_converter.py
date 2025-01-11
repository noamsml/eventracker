from submissions import converter
from db import model
from api import api_models
from datetime import date
import json

DESCRIPTION = "Come celebrate or comiserate depending on what the voting gods bring"
SUBMITTER = "Noam Samuel"
NAME = "Election party!"
LOCATION = "Oakland"
ADDRESS = "At some point this still has to be test data"
LINK = "https://www.sos.ca.gov/elections"
ELECTION_DAY = date(2024, 11, 5)
SUBMISSION_DATE = date(2024, 10, 18)
START_TIME = api_models.TimeOfDay(hour=19, minute=0, second=0)
END_TIME = api_models.TimeOfDay(hour=23, minute=0, second=0)

EXPECTED_DATES_TIMES=[
        {
            "date": "2024-11-05",
            "start": {"hour": 19, "minute": 0, "second": 0},
            "end": {"hour": 23, "minute": 0, "second": 0},
        }
    ]


def test_convert_submission_to_db():
    submission = api_models.EventSubmission(
        date_submitted=SUBMISSION_DATE,
        submitter_name=SUBMITTER,
        name=NAME,
        type="Party",
        dates_times=[
            api_models.EventDateTime(
                date=ELECTION_DAY,
                start=START_TIME,
                end=END_TIME,
            )
        ],
        description=DESCRIPTION,
        location=LOCATION,
        address=ADDRESS,
        cost="$0",
        link=LINK,
    )

    converted = converter.api_to_db(submission)

    assert converted.date_submitted == SUBMISSION_DATE
    assert converted.submitter_name == SUBMITTER
    assert converted.name == NAME
    assert converted.type == "Party"
    assert json.loads(converted.dates_and_times) == EXPECTED_DATES_TIMES
    assert converted.description == DESCRIPTION
    assert converted.location == LOCATION
    assert converted.address == ADDRESS
    assert converted.cost == "$0"
    


