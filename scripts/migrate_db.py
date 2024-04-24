#!/usr/bin/env python

# Basic db creation script. To be improved upon.

from script_context import script_init
script_init()

import sys

import db.model as model
import db.connectivity as connectivity

engine = connectivity.make_db_engine()

if __name__ == "__main__":
    if "--drop" in sys.argv:
        model.Base.metadata.drop_all(engine)
    model.Base.metadata.create_all(engine)

