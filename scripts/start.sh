#!/bin/bash

set -ex

docker run \
	-it \
	-d \
	-v $PWD/data:/opt/src/data \
	--restart=unless-stopped \
	--name twitter-crawler \
	twitter-crawler
