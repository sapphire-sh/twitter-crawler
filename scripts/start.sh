#!/bin/bash

set -ex

docker run \
	-it \
	-d \
	-v $PWD/data:/opt/src/data \
	--restart=always \
	--name twitter-crawler \
	twitter-crawler
