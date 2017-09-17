#!/bin/bash
docker build -t hyperapp-test .
docker run --rm -ti hyperapp-test "$@"
