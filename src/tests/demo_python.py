import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
import sys,os
import time
import numpy as np

class UpdatePlot(object):
    def __init__(self, ax, wdb, filter, target, n_bin):
        self.success = 0
        self.line, = ax.plot([], [], 'k-')
        self.ax = ax
        self.n_bin = n_bin

        # Set up plot parameters
        self.ax.grid(True)

    def init(self):
        self.success = 0
        self.line.set_data([], [])
        return self.line,

    def __call__(self, i):
        # This way the plot can continuously run and we just keep
        # watching new realizations of the process
        if i == 0:
            return self.init()

        # Query things and update plot
        results = wdb.Query(filter,target)
        energies = []
        count = 0
        for res in results:
            if "Unresolved" in res:
                count += 1
            else:
                energies.append(float(res))
        if len(energies) > 0:
            hist,bin_edges = np.histogram(energies,self.n_bin)
            bin_centers = [(bin_edges[i]+bin_edges[i+1]/2.) for i in range(self.n_bin)]
            self.line.set_data(bin_centers, hist)
            self.ax.set_xlim(min(bin_centers),max(bin_centers))
            self.ax.set_ylim(min(hist),max(hist))
        return self.line,

# Make WhiplashDB in_sweepstance
wdb_home = os.environ.get('WDB_HOME')
sys.path.append(wdb_home+'/lib/python')
import whiplashdb
wdb = whiplashdb.wdb(wdb_home)

# Settings
prob_class = 'ising'
owner = 'ebrown'
n_probs = 1
n_reps = 10000
n_sweeps = [100]

# Executable
print 'Committing executables'
executable = {'class':prob_class,'owner':owner,'description':'foo','algorithm':'SA','version':'bar','build':'O3','schedule':'linear','path':wdb_home+'/bin/test.app'}
executable_id = wdb.CommitExecutable(executable)
print executable_id

# Models
print 'Committing models'
model = {'class':prob_class,'owner':owner,'lattice_type':'random','coupling_type':'gaussian'}
paths = []
for i_prob in range(n_probs):
    paths.append(wdb_home+'/src/tests/108ising.lat') # Normally would randomly generate these
model_ids = wdb.CommitModels(model, paths)
print model_ids

# Properties
print 'Committing properties'
for n_sweep in n_sweeps:
    property = {'class':prob_class,'owner':owner,'executable':executable_id,'n_sweeps':n_sweep,'T_0':10.0,'T_1':1e-8}
    property_ids = wdb.CommitProperties(property, model_ids, n_reps)
    print property_ids

# Form query
filter = {'class':prob_class}
target = ['cfg','costs']

# Query and update plot continuously
fig = plt.figure()
ax = fig.add_subplot(1, 1, 1)
n_props = n_probs*n_reps*len(n_sweeps)
up = UpdatePlot(ax, wdb, filter, target, 10)
anim = FuncAnimation(fig, up, frames=np.arange(n_props), init_func=up.init, interval=10, blit=False)
plt.show()

