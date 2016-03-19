#!/bin/bash

(cd $WHIPLASH_HOME/api && node --use_strict bin/api > /dev/null 2>&1 &)
