import sys

class ProblemClass:
    def __init__(self):
        self.model_required = ['class','owner','cfg']
        self.executable_required = ['class','owner','path','description','algorithm','version','build','name']
        self.property_required = ['class','owner','model_id','executable_id','cfg']
    def get_model_required(self):
        return self.model_required
    def get_executable_required(self):
        return self.executable_required
    def get_property_required(self):
        return self.property_required

class Ising(ProblemClass):
    def get_model_required(self):
        return self.model_required + ['cfg.n_spins','cfg.edges']
    def get_property_required(self):
        return self.property_required + ['cfg.costs','cfg.cfgs']

def DetectClass(X):
    if X['class'] == 'ising':
        return Ising()
    else:
        print 'Problem class does not exist'
        sys.exit(0)
