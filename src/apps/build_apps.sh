#!/bin/bash

git submodule update --init
export WDB_HOME=$(pwd)/../../
cd anc && make -j single && cd ../
cd spin_glass_solver && mkdir build && cd build/ && cmake .. && make -j && make install && cd ../
