#!/bin/bash

#from src
#./apps/drivers/commit_executable.driver -class ising -owner zilia -description foo -algorithm test_algo -version 1 -build O3 -path apps/test.app 

#from src
#/export/data1/whiplashdb/src/apps/drivers/commit_executable.driver -class ising -owner zilia -description foo -algorithm test_algo -version 1 -build O3 -path /export/data1/whiplashdb/src/apps/test.app 

#from src
#/export/data1/whiplashdb/bin/commit_executable.driver -class ising -owner zilia -description foo -algorithm test_algo -version 1 -build O3 -path /export/data1/whiplashdb/src/apps/test.app

#from src
cd ${WDB_HOME}/src && /export/data1/whiplashdb/bin/commit_executable.driver -class ising -owner zilia -description foo -algorithm test_algo -version 1 -build O3 -path /export/data1/whiplashdb/bin/test.app

#/export/data1/whiplashdb/bin/commit_executable.driver -class ising -owner zilia -description foo -algorithm test_algo -version 1 -build O3 -path /export/data1/whiplashdb/bin/test.app

#./src/apps/drivers/commit_executable.driver -class ising -owner zilia -description foo -algorithm test_algo -version 1 -build O3 -path /export/data1/whiplashdb/src/apps/test.app
