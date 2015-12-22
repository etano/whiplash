#!/bin/bash

# monchc300
ssh -t whiplash@monch.cscs.ch "ssh monchc300 'cd whiplash && source ./scripts/init_monch.sh && git pull && sh ./scripts/restart_all_monch.sh'"

# whiplash.ethz.ch
/usr/bin/docker-compose -f www.yml stop
/usr/bin/docker-compose -f www.yml rm -f
/usr/bin/docker-compose -f www.yml build
/usr/bin/docker-compose -f www.yml up -d --force-recreate
cp config/nginx/whiplashwww /etc/nginx/sites-available/
cp config/nginx/whiplashapi /etc/nginx/sites-available/
service nginx restart
