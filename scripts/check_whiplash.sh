#!/bin/bash

ps aux | grep 'mongod' | grep -v grep && ps aux | grep 'nginx' | grep -v grep && ps aux | grep 'node' | grep -v grep

