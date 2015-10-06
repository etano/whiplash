'''Hyperparameter optimisation routing using the MOE library developed
model from which the next most likely sample point is inferredby Yelp
Research. The current sample points are fitted with a Gaussian Process
model from which the next most likely sample point is inferred.

should be ran in a docker VM inside the MOE container. pull latest
version of the MOE container and run the MOE container while mapping
the whiplashdb directory into the container. like so

docker pull yelpmoe/latest 
docker run -d --name moe -v ${WDB_HOME}:/home/app/MOE/whiplashdb yelpmoe/latest

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
