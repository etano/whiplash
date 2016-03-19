#!/bin/bash

echo; echo 'Running demo cases...';
echo; ./demo.sh $1

echo; echo 'Running test suites selection...'
$1 ./fetch.test
$1 ./optional.test
