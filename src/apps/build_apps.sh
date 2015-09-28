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
cd DT-SQA && make clean && make -j${NTHREADS} && cd ../

## XX solver ##
cd XXcode && make -f Makefile.wdb clean && make -f Makefile.wdb -j${NTHREADS} && cd ../

## Annealing codes ##
cd anc && make clean && make -j${NTHREADS} single && cd ../

## unitary evolution
cd unitary_evolution_wrap 
if [ ! -d "build" ]; then
  mkdir build
else
  rm -rf build
  mkdir build
fi
cd build/ && cmake .. && make -j${NTHREADS} && make install
cd ../../

## Spin glass solver ##
cd spin_glass_solver
if [ ! -d "build" ]; then
  mkdir build
else
  rm -rf build
  mkdir build
fi
cd build/ && cmake .. && make -j${NTHREADS} && make install
cd ../../

