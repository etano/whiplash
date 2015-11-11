#!/bin/bash

numactl --interleave=all mongod --config mongod.conf
