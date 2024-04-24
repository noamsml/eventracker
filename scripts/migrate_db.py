#!/usr/bin/env python

# Basic db creation script. To be improved upon.

from script_context import script_init
script_init()

import sys

import db.db_model as db_model
import db.db_connectivity as db_connectivity

engine = db_connectivity.make_db_engine()

if __name__ == "__main__":
    if "--drop" in sys.argv:
        db_model.Base.metadata.drop_all(engine)
    db_model.Base.metadata.create_all(engine)

