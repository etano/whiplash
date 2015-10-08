'''Hyperparameter optimisation using the MOE library developed by Yelp
Research. At its core it uses a Gaussian Process model to fit points
and infer the next most likely sample point.  

This script should be ran from the MOE container inside a docker
VM. We therefore pull latest version of the MOE container and run the
MOE container while mapping the whiplash directory into the
container.

docker pull yelpmoe/latest 
docker run -d --name moe -v ${WDB_HOME}:/home/app/MOE/whiplash yelpmoe/latest

'''

import json
from moe.easy_interface.experiment import Experiment
from moe.easy_interface.simple_endpoint import gp_next_points
from moe.optimal_learning.python.data_containers import SamplePoint

#load data points from file
data = json.load(open('experiment.json'))
var = data['var']

#put data points into Experiment object
exp = Experiment(data['limits'])
for point in data['points']:
    exp.historical_data.append_sample_points([SamplePoint(point[0], point[1], var)])

#sample next most promising point from Gaussian Process
print gp_next_points(exp, **{})[0]
