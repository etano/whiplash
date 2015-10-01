#!/bin/bash

cd ${WDB_HOME}/src && ${WDB_HOME}/bin/commit_executable.driver -class ising -owner zilia -description foo -algorithm test_algo -version 1 -build O3 -path ${WDB_HOME}/bin/test.app -dbhost localhost:27017 -name "test"
