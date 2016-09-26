#!/bin/bash

apidoc -i ../ -o ../docs -f "libs/routes/.*\\.js$"  -f "libs/collections/.*\\.js$"
