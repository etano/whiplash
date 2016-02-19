#!/bin/bash

host=$1
command=$2
ssh -t whiplash@monch.cscs.ch "ssh -t ${host} '${command}'"
