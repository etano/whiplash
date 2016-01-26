#!/bin/bash

EC2_USER="ubuntu"
EC2_HOST="ec2-54-93-123-208.eu-central-1.compute.amazonaws.com"

sh tsp_ising_mapper/push_image.sh
sh spins2route/push_image.sh
(cd DT-SQA && git checkout demo && sh DT-SQA/push_image.sh)
sh scripts/push_images.sh
sh scripts/cloud_deploy_docker.sh ${EC2_USER}@${EC2_HOST}
