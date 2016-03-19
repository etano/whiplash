#!/bin/bash

# monchc300
ssh whiplash@monch.cscs.ch "ssh monchc300 'source /etc/profile && cd whiplash && source scripts/init_monch.sh && git pull && nohup sh scripts/restart_all_monch.sh > /mnt/lnec/whiplash/logs/restart.log 2> /mnt/lnec/whiplash/logs/restart.err < /dev/null &'"

# whiplash.ethz.ch
/usr/bin/docker-compose -f www.yml stop
/usr/bin/docker-compose -f www.yml rm -f
/usr/bin/docker-compose -f www.yml build
/usr/bin/docker-compose -f www.yml up -d --force-recreate
cp -f config/nginx/whiplashwww /etc/nginx/sites-available/
cp -f config/nginx/whiplashapi /etc/nginx/sites-available/
service nginx restart
