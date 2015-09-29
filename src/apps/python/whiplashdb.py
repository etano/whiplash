from subprocess import Popen, PIPE
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
import numpy as np
import sys,pymongo,json,time

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
            hist,bin_edges = np.histogram(energies,self.n_bin)
            xs,ys = [],[]
            for i in range(len(hist)):
                if hist[i] != 0:
                    xs.append(bin_edges[i]+bin_edges[i+1]/2.)
                    ys.append(hist[i])
            #self.ax.set_xlim(min(xs),max(xs))
            #self.ax.set_ylim(min(ys),max(ys))
            self.line.set_data(xs,ys)
            self.ax.fill_between(xs,0,ys,alpha=0.6,facecolor='crimson')
        return self.line,

# WhiplashDB class
class wdb:
    def __init__(self,wdb_home,server,use_cpp_drivers=false):
        self.wdb_home = wdb_home
        self.server = server
        self.use_cpp_drivers = use_cpp_drivers
        self.client = pymongo.MongoClient(self.server)
        self.models = client['wdb']['models']
        self.executables = client['wdb']['executables']
        self.properties = client['wdb']['properties']

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
        if self.use_cpp_drivers:
            args = self.FormArgs(self.wdb_home+'/bin/commit_executable.driver',executable)
            return self.Execute(args)[0]
        else:
            required_fields = ['class','owner','path','description','algorithm','version','build']
            for field in required_fields:
                if field not in data:
                    print 'Please add field:',field
                    sys.exit(0)
            _id = executables.find().count()
            executable['_id'] = _id
            executable['timestamp'] = time.time()
            self.executables.insert_one(executable)
            return _id

    def CommitModel(self,model):
        if self.use_cpp_drivers:
            args = self.FormArgs(self.wdb_home+'/bin/commit_model.driver',model)
            return self.Execute(args)[0]
        else:
            required_fields = ['class','owner','cfg']
            for field in required_fields:
                if field not in model:
                    print 'Please add field:',field
                    sys.exit(0)
            _id = self.models.find().count()
            model['_id'] = _id
            model['timestamp'] = time.time()
            self.models.insert_one(model)
            return _id

    def CommitModels(self,models):
        if self.use_cpp_drivers:
            model['path'] = ','.join(paths)
            args = self.FormArgs(self.wdb_home+'/bin/commit_model.driver',model)
            return self.Execute(args)
        else:
            required_fields = ['class','owner','cfg']
            _ids = []
            for model in models:
                for field in required_fields:
                    if field not in model:
                        print 'Please add field:',field
                        sys.exit(0)
                _id = self.models.find().count()
                _ids.append(id)
                model['_id'] = _id
                model['timestamp'] = time.time()
            self.models.insert_many(models)
            return _ids

    def CommitProperty(self,property):
        if self.use_cpp_drivers:
            args = self.FormArgs(self.wdb_home+'/bin/commit_property.driver',property)
            return self.Execute(args)[0]
        else:
            required_fields = ['class','owner','model_id','executable_id','cfg']
            for field in required_fields:
                if field not in property:
                    print 'Please add field:',field
                    sys.exit(0)
            _id = self.properties.find().count()
            property['status'] = 3 # FIXME: This should not be fixed in future versions
            if 'seed' not in property:
                property['seed'] = _id
            if 'walltime' not in property:
                property['walltime'] = -1
            property['_id'] = _id
            property['timestamp'] = time.time()
            self.properties.insert_one(property)
            return _id

    def CommitProperties(self,properties):
        if self.use_cpp_drivers:
            properties['reps'] = reps
            properties['model'] = ','.join(model_ids)
            args = self.FormArgs(self.wdb_home+'/bin/commit_property.driver',properties)
            return self.Execute(args)
        else:
            required_fields = ['class','owner','model_id','executable_id','cfg']
            for property in properties:
                for field in required_fields:
                    if field not in property:
                        print 'Please add field:',field
                        sys.exit(0)
                _id = self.properties.find().count()
                property['status'] = 3 # FIXME: This should not be fixed in future versions
                if 'seed' not in property:
                    property['seed'] = _id
                if 'walltime' not in property:
                    property['walltime'] = -1
                property['_id'] = _id
                property['timestamp'] = time.time()
            self.properties.insert_many(properties)
            return _id

    def RealTimeHist(self,filter,target,nbins=1000,frames=10000,interval=100):
        fig = plt.figure()
        ax = fig.add_subplot(1, 1, 1)
        filter['status'] = 3
        up = UpdatePlot(ax, self.properties, filter, target, nbins)
        anim = FuncAnimation(fig, up, frames=frames, init_func=up.init, interval=interval, blit=False)
        plt.show()
