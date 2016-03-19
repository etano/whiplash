#!/bin/bash

numactl --interleave=all mongod --config config/mongo/mongod.conf
