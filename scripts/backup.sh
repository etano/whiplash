#!/bin/bash

max_files=10
backup_dir="/mnt/lnec/whiplash/backups"

if [ $(ls ${backup_dir} | wc -l) -ge ${max_files} ]
then
    rm -rf $(ls -t ${backup_dir} | tail -n 1)
fi

/users/whiplash/mongodb-linux-x86_64-3.2.1/bin/mongodump -d wdb -u pwn -p cftXzdrjheHEARuJKT39x]3sV -o ${backup_dir}/$(date +"%d-%m-%y-%T")
