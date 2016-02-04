#!/bin/bash

ssh -t whiplash@monch.cscs.ch 'ssh -t monchc300 "sh whiplash/scripts/backup.sh"'
