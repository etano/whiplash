#!/bin/bash

apidoc -i ../api -o ../www/public/docs/api -f "libs/routes/.*\\.js$"  -f "libs/collections/.*\\.js$"
