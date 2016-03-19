#!/bin/bash

ssh -t whiplash@monch.cscs.ch 'ssh -t monchc300 "sh whiplash/deployment/cluster/monch/big/backup.sh"'
