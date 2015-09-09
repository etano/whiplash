#!/bin/bash

export PKG_CONFIG_PATH=/usr/local/lib/pkgconfig:$PKG_CONFIG_PATH
export LD_LIBRARY_PATH=`pwd`/apps:$LD_LIBRARY_PATH
export PATH=`pwd`/apps/drivers:$PATH

#git submodule update --init
export WDB_HOME=$(pwd)/../../

## Discrete time SQA ##
cd DT-SQA && make clean && make -j && cd ../

## XX solver ##
cd XXcode && make -f Makefile.wdb clean && make -f Makefile.wdb -j && cd ../

## Annealing codes ##
#cd anc && make clean && make -j single
#cd ../

## Spin glass solver ##
cd spin_glass_solver
if [ ! -d "build" ]; then
  mkdir build
else
  rm -rf build
  mkdir build
fi
cd build/ && cmake .. && make -j && make install
cd ../../

