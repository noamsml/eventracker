#!/bin/bash

PORT=3941
export ENV=production

source env/bin/activate

uvicorn --port=$PORT api.api:app