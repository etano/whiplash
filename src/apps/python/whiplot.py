import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
from numpy import histogram

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
        self.ax.set_xlim(-115,0)
        self.ax.set_ylim(0,900)

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
            hist,bin_edges = histogram(energies,self.n_bin)
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
