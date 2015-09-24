from subprocess import Popen, PIPE
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
import numpy as np
from pymongo import MongoClient

# Updating plot
class UpdatePlot(object):
    def __init__(self, ax, collection, filter, target, n_bin):
        self.success = 0
        self.line, = ax.plot([], [], 'g.')
        self.ax = ax
        self.ax.fill_between([],0,[])
        self.n_bin = n_bin
        self.filter = filter
        self.target = target
        self.target_joined = '.'.join([str(x) for x in target])
        self.collection = collection

    def init(self):
        self.success = 0
        self.line.set_data([], [])
        return self.line,

    def __call__(self, i):
        # Set up plot parameters
        self.ax.cla()
        self.ax.grid(True)
        #self.ax.set_xlim(-115,-35)
        #self.ax.set_ylim(0,1250)

        # This way the plot can continuously run and we just keep
        # watching new realizations of the process
        if i == 0:
            return self.init()

        # Query things and update plot
        results = []
        for result in self.collection.find(self.filter,{self.target_joined:1,"_id":0}):
            for name in self.target:
                result = result[name]
            if hasattr(result, "__len__"):
                results += list(result)
            else:
                results.append(result)
        energies = []
        for res in results:
            energies.append(float(res))
        if len(energies) > 0:
            hist,bin_edges = np.histogram(energies,self.n_bin)
            xs,ys = [],[]
            for i in range(len(hist)):
                if hist[i] != 0:
                    xs.append(bin_edges[i]+bin_edges[i+1]/2.)
                    ys.append(hist[i])
            self.ax.set_xlim(min(xs),max(xs))
            self.ax.set_ylim(min(ys),max(ys))
            self.line.set_data(xs,ys)
            self.ax.fill_between(xs,0,ys,alpha=0.6,facecolor='crimson')
        return self.line,

# WhiplashDB class
class wdb:
    def __init__(self,wdb_home):
        self.wdb_home = wdb_home

    def FormArgs(self,path,entity):
        args = [path]
        for (key,val) in entity.items():
            args.append('-'+key)
            args.append(str(val))
        return args

    def Execute(self,args):
        p = Popen(args,stdout=PIPE,stderr=PIPE,bufsize=1)
        (stdout, stderr) = p.communicate()
        res = [x for x in stdout.split('\n') if x]
        return res

    def CommitExecutable(self,executable):
        args = self.FormArgs(self.wdb_home+'/bin/commit_executable.driver',executable)
        return self.Execute(args)[0]

    def CommitModel(self,model):
        args = self.FormArgs(self.wdb_home+'/bin/commit_model.driver',model)
        return self.Execute(args)[0]

    def CommitModels(self,model,paths):
        model['path'] = ','.join(paths)
        args = self.FormArgs(self.wdb_home+'/bin/commit_model.driver',model)
        return self.Execute(args)

    def CommitProperty(self,property):
        args = self.FormArgs(self.wdb_home+'/bin/commit_property.driver',property)
        return self.Execute(args)[0]

    def CommitProperties(self,property,model_ids,reps):
        property['reps'] = reps
        property['model'] = ','.join(model_ids)
        args = self.FormArgs(self.wdb_home+'/bin/commit_property.driver',property)
        return self.Execute(args)

    def RealTimeHist(self,filter,target,nbins=1000,frames=10000,interval=100):
        client = MongoClient()
        properties = client['wdb']['properties']
        fig = plt.figure()
        ax = fig.add_subplot(1, 1, 1)
        filter['status'] = 3
        up = UpdatePlot(ax, properties, filter, target, nbins)
        anim = FuncAnimation(fig, up, frames=frames, init_func=up.init, interval=interval, blit=False)
        plt.show()
