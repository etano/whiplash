# set up EC2 instance on AWS with ports 22 and 1337 open for incoming
  TCP and containing the public key of the client

# upload images to dockerhub
sh scripts/push_images.sh

# deploy to EC2
sh scripts/cloud_deploy_docker.sh [ubuntu@ec2_host]

# run demo
python demo/reset.py [ec2_host]
python demo/showcase1.py [ec2_host]
python demo/showcase1.py [ec2_host]
