#!/bin/bash

set -ex

docker run \
	-it \
	-d \
	-v $PWD/data:/opt/src/data \
	--restart=on-failure \
	--name twitter-crawler \
	twitter-crawler
