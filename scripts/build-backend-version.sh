#!/bin/bash

cd $(dirname $0)/..
VERSION=$(cat VERSION)

docker build --platform linux/amd64,linux/arm64 -t noamsml/decentered-events:${VERSION} . -f kubernetes/containers/backend.dockerfile
docker push noamsml/decentered-events:${VERSION}