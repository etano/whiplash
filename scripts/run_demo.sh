#!/bin/bash

EC2_HOST="ec2-54-93-123-208.eu-central-1.compute.amazonaws.com"

python demo/reset.py ${EC2_HOST}
python demo/showcase1.py ${EC2_HOST}
python demo/showcase1.py ${EC2_HOST}
