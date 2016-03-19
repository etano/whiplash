#!/bin/bash

username = $1
password = $2

cat ~/.ssh/id_rsa.pub | sshpass -p ${password} ssh ${username}@monch.cscs.ch "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
