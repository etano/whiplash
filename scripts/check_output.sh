#!/bin/bash

for a in $(ls); do cat $a/out.o; cat $a/out.e; done 2> /dev/null #| tail -n 40
