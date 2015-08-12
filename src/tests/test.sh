#!/bin/bash

echo 'Running test suites selection...'
$1 ./fetch.test
$1 ./optional.test
