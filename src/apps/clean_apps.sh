#!/bin/bash

cd DT-SQA && make clean && cd ..
cd XXcode && make -f Makefile.wdb clean && cd ..
cd anc && make clean; cd ..
rm -rf spin_glass_solver/build
