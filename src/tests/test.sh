#!/bin/bash

echo 'Running test suites selection...'
$1 ./property.test
$1 ./optional.test
