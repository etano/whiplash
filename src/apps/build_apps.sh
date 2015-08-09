#!/bin/bash

git submodule update --init
export WDB_HOME=$(pwd)/../../
cd anc && make -j single
cd ../
cd spin_glass_solver
if [ ! -d "build" ]; then
  mkdir build
fi
cd build/ && cmake .. && make -j && make install
cd ../../
cd DT-SQA && make -j && cd ../
