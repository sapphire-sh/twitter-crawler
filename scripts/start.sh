#!/bin/bash

set -ex

docker run -it -d -v $PWD/data:/opt/src/data twitter-crawler
