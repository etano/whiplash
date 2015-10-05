#!/bin/bash

#export LD_LIBRARY_PATH=`pwd`/apps:$LD_LIBRARY_PATH
#export PATH=`pwd`/apps/drivers:$PATH
#export WDB_HOME=$(pwd)/../../

#git submodule update --init

NTHREADS=1
if [ $(uname -s) == "Linux" ]
then
    NTHREADS=$(nproc)
else
    NTHREADS=$(sysctl -n hw.ncpu)
fi

## Discrete time SQA ##
cd DT-SQA
make clean && make -j${NTHREADS} && cp dtsqa.shared ${WDB_HOME}/bin/
cd ../

## XX solver ##
cd XXcode
make -f Makefile.wdb clean && make -f Makefile.wdb -j${NTHREADS} && cp xx.app ${WDB_HOME}/bin/
cd ../

## Annealing codes ##
cd anc
make clean && make single && cp *.shared ${WDB_HOME}/bin/
cd ../

## Unitary evolution
cd unitary_evolution
if [ ! -d "build" ]; then
  mkdir build
else
  rm -rf build
  mkdir build
fi
cd build/
cmake .. && make -j${NTHREADS} && make install && cp ../bin/ue_solver.shared ${WDB_HOME}/bin/
cd ../../

## Spin glass solver ##
cd spin_glass_solver
if [ ! -d "build" ]; then
  mkdir build
else
  rm -rf build
  mkdir build
fi
cd build/
cmake .. && make -j${NTHREADS} && make install && cp ../bin/main ${WDB_HOME}/bin/spin_glass_solver
cd ../../
