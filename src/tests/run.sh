#!/bin/bash

echo; echo 'Running demo cases...';
echo; ./demo0.sh $1
echo; ./demo_anc.sh $1
echo; ./demo_sgs.sh $1

echo; echo 'Running test suites selection...'
$1 ./fetch.test
$1 ./optional.test
