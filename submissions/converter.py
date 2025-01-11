from api import api_models
from db import model
import pydantic_core

def api_to_db(submission: api_models.EventSubmission):
    return model.EventSubmission(
        date_submitted = submission.date_submitted,
        submitter_name = submission.submitter_name,
        name = submission.name,
        type = submission.type,
        location = submission.location,
        dates_and_times = pydantic_core.to_json(submission.dates_times),
        address = submission.address or "",
        description = submission.description or "" ,
        cost = submission.cost,
        link = submission.link or ""
    )