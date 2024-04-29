#!/bin/bash

export ENV=production

source env/bin/activate

python scripts/import_events.py