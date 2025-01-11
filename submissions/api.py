from fastapi import FastAPI, HTTPException, Depends
from typing import List, Annotated
import api.api_models as api_models
import db.connectivity as connectivity
import db.model as model
import db.access as access
from datetime import date, datetime, timedelta
from sqlalchemy import Engine
import config
from dateutil.tz import gettz
import submissions.converter

@app.post("submit")
def post_submission(engine: Annotated[Engine, Depends(connectivity.make_db_engine)], now_timestamp: Annotated[datetime, Depends(now_timestamp)], event_submission: api_models.EventSubmission):
    validate_submission(event_submission, now_timestamp)

    access.persist_submission(submissions.converter.convert_submission(event_submission))
    return { "success": True }


def validate_submission(event_submission: api_models.EventSubmission, now_timestamp: datetime):
    if event_submission.id != None:
        raise HTTPException(status_code=400, detail="Unknown field 'id'")

    if len(event_submission.dates_times) == 0:
        raise HTTPException(status_code=400, detail="No dates or times specified")

    for date_time in event_submission.dates_times:
        if date_time.date < now_timestamp:
            raise HTTPException(status_code=400, detail="Date {} is in the past!".formate(date_time.date))