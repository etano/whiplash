#!/bin/bash

cd anc && make clean; cd ..
rm -rf spin_glass_solver/build
cd DT-SQA && make clean && cd ..
