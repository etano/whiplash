#!/bin/bash

# monchc300
ssh -t whiplash@monch.cscs.ch "ssh monchc300 'source ~/whiplash/scripts/init_monch.sh && cd ~/whiplash/ && /apps/monch/git/1.8.4.1/bin/git pull && sh ~/whiplash/scripts/restart_all_monch.sh'"

# whiplash.ethz.ch
/usr/bin/docker-compose -f www.yml stop
/usr/bin/docker-compose -f www.yml rm -f
/usr/bin/docker-compose -f www.yml build
/usr/bin/docker-compose -f www.yml up -d --force-recreate
cp config/nginx/whiplashwww /etc/nginx/sites-available/
cp config/nginx/whiplashapi /etc/nginx/sites-available/
service nginx restart
