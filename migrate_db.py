#!/usr/bin/env python

# Basic db creation script. To be improved upon.

import sys

import db_model
import db_connectivity

engine = db_connectivity.make_db_engine()

if __name__ == "__main__":
    if "--drop" in sys.argv:
        db_model.Base.metadata.drop_all(engine)
    db_model.Base.metadata.create_all(engine)

