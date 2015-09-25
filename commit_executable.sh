#!/bin/bash

cd ${WDB_HOME}/src && /export/data1/whiplashdb/bin/commit_executable.driver -class ising -owner zilia -description foo -algorithm test_algo -version 1 -build O3 -path /export/data1/whiplashdb/bin/test.app
