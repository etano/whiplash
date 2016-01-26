EC2: ubuntu@ec2-52-59-251-46.eu-central-1.compute.amazonaws.com

1) set up EC2 instance on AWS with ports 22 and 1337 open for incoming
  TCP and containing the public key of the client and 30GB SSD

2) upload tsp to ising mapper to dockerhub
sh tsp_ising_mapper/push_image.sh

3) upload spins to route mapper to dockerhub
sh spins2route/push_image.sh

4) upload dtsqa solver to dockerhub
(cd DT-SQA && git checkout demo && sh DT-SQA/push_image.sh)

5) upload whiplash to dockerhub
sh scripts/push_images.sh

6) deploy to EC2
sh scripts/cloud_deploy_docker.sh [ubuntu@ec2_host]

4) run demo
python demo/reset.py [ec2_host]
python demo/showcase1.py [ec2_host]
python demo/showcase1.py [ec2_host]
