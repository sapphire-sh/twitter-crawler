#!/bin/bash

set -ex

docker build -f ./Dockerfile -t twitter-crawler .
