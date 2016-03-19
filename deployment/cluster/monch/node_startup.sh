#!/bin/bash

(cd api && node --use_strict bin/api > /dev/null 2>&1 &)
