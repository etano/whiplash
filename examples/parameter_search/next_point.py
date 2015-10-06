import json
from moe.easy_interface.experiment import Experiment
from moe.easy_interface.simple_endpoint import gp_next_points
from moe.optimal_learning.python.data_containers import SamplePoint

data = json.load(open('experiment.json'))
var = data['var']

exp = Experiment(data['limits'])
for point in data['points']:
    exp.historical_data.append_sample_points([SamplePoint(point[0], point[1], var)])

print gp_next_points(exp, **{})[0]
