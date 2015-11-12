#!/bin/bash

top -p "$(pgrep -d ',' mongod),$(pgrep -d ',' node),$(pgrep -d ',' scheduler_users)"
