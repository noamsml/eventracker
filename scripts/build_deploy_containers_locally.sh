#!/bin/bash

cd $(dirname $0)/..

docker build --platform linux/amd64,linux/arm64 -t noamsml/decentered-events . -f kubernetes/containers/backend.dockerfile
docker build --platform linux/amd64,linux/arm64 -t noamsml/decentered-frontend . -f kubernetes/containers/frontend.dockerfile
docker push noamsml/decentered-events:latest
docker push noamsml/decentered-frontend:latest