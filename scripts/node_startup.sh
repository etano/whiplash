#!/bin/bash

(cd api && NODE_ENV=production node --prof --use_strict bin/api > /dev/null 2>&1 &)
