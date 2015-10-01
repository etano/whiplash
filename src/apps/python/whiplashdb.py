import sys,os,pymongo,json,time
from whiplot import *
import problem_classes
from subprocess import Popen, PIPE

# WhiplashDB class
class wdb:
    def __init__(self,server,use_cpp_drivers=False):
        self.wdb_home = os.environ.get('WDB_HOME')
        self.server = server
        self.use_cpp_drivers = use_cpp_drivers
        self.client = pymongo.MongoClient(self.server)
        self.client.wdb.authenticate('zilia','zilia')
        self.models = self.client['wdb']['models']
        self.executables = self.client['wdb']['executables']
        self.properties = self.client['wdb']['properties']

    def FormArgs(self,path,entity):
        args = [path]
        for (key,val) in entity.items():
            args.append('-'+key)
            args.append(str(val))
        args.append('-dbhost')
        args.append(self.server)
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
            for field in problem_classes.DetectClass(executable).get_executable_required():
                if field not in executable:
                    print 'Please add field:',field
                    sys.exit(0)
            _id = self.executables.find().count()
            executable['_id'] = _id
            executable['timestamp'] = time.time()
            self.executables.insert_one(executable)
            return _id

    def CommitModel(self,model):
        if self.use_cpp_drivers:
            args = self.FormArgs(self.wdb_home+'/bin/commit_model.driver',model)
            return self.Execute(args)[0]
        else:
            model = json.load(open(model['path'])) #TODO: do this for the rest
            for field in problem_classes.DetectClass(model).get_model_required():
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
            _ids = []
            for model in models:
                for field in problem_classes.DetectClass(model).get_model_required():
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
            for field in problem_classes.DetectClass(property).get_property_required():
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

    def CommitProperties(self,properties,model_ids=[],n_reps=1):
        if self.use_cpp_drivers:
            properties['reps'] = n_reps
            properties['model_id'] = ','.join(model_ids)
            args = self.FormArgs(self.wdb_home+'/bin/commit_property.driver',properties)
            print args
            return self.Execute(args)
        else:
            count = self.properties.find().count()
            for property in properties:
                for field in problem_classes.DetectClass(property).get_property_required():
                    field = field.split('.')
                    if field[0] not in property:
                        print 'Please add field:',field
                        sys.exit(0)
                    if len(field) > 1:
                        for subfield in field[1:]:
                            if subfield not in property[field[0]]:
                                print 'Please add field:',field[0],subfield
                                sys.exit(0)
                _id = count
                count += 1
                property['status'] = 3 # FIXME: This should not be fixed in future versions
                if 'seed' not in property:
                    property['seed'] = _id
                if 'walltime' not in property:
                    property['walltime'] = -1
                property['_id'] = _id
                property['timestamp'] = time.time()
            self.properties.insert_many(properties)
            return _id

    def Query(self,collection,filter):
        ids = []
        for res in collection.find(filter,{"_id":1}):
            ids.append(res['_id'])
        return ids

    def QueryModels(self,filter):
        return self.Query(self.models,filter)

    def QueryExecutables(self,filter):
        return self.Query(self.executables,filter)

    def QueryProperties(self,filter):
        return self.Query(self.properties,filter)

    def Fetch(self,collection,id):
        return collection.find_one({'_id':id})

    def FetchModel(self,id):
        return self.Fetch(self.models,id)

    def FetchExecutable(self,id):
        return self.Fetch(self.executables,id)

    def FetchProperty(self,id):
        return self.Fetch(self.properties,id)

    def RealTimeHist(self,filter,target,nbins=1000,frames=10000,interval=100):
        fig = plt.figure()
        ax = fig.add_subplot(1, 1, 1)
        filter['status'] = 3
        up = UpdatePlot(ax, self.properties, filter, target, nbins)
        anim = FuncAnimation(fig, up, frames=frames, init_func=up.init, interval=interval, blit=False)
        plt.show()
