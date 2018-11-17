#!/bin/bash

set -ex

HOSTNAME='172.17.0.1';
if [[ "$OSTYPE" == "darwin"* ]];
then
    HOSTNAME='host.docker.internal';
fi

docker build \
	-f ./Dockerfile \
	-t twitter-crawler \
	--build-arg hostname=${HOSTNAME} \
	.
