import sys,os,pymongo,json,time
from whiplot import *
import problem_classes
from subprocess import Popen, PIPE

# WhiplashDB class
class wdb:
    def __init__(self,server,user="",password=""):
        self.wdb_home = os.environ.get('WDB_HOME')
        self.server = server
        self.user = user
        self.client = pymongo.MongoClient(self.server)
        if user != "":
            self.client.wdb.authenticate(self.user,password)
        if not ('wdb' in self.client.database_names()): # Initialize the database
            db = self.client['wdb']
            db.create_collection('models')
            db.create_collection('executables')
            db.create_collection('properties')
            db.create_collection('counters')
        self.models = self.client['wdb']['models']
        self.executables = self.client['wdb']['executables']
        self.properties = self.client['wdb']['properties']

    def VerifyField(self,object,field):
        field = field.split('.')
        if field[0] not in object:
            print 'Please add field:',field,' to object:',object
            sys.exit(0)
        if len(field) > 1:
            for subfield in field[1:]:
                if subfield not in object[field[0]]:
                    print 'Please add field:',field[0],subfield,' to object:',object
                    sys.exit(0)

    def Sign(self,collection,object):
        object['owner'] = self.user
        object['_id'] = collection.find().count()
        object['timestamp'] = time.time()

    def Verify(self,collection,object):
        if(collection == self.models):
            for field in problem_classes.DetectClass(object).get_model_required():
                self.VerifyField(object,field)
        elif(collection == self.executables):
            for field in problem_classes.DetectClass(object).get_executable_required():
                self.VerifyField(object,field)
        elif(collection == self.properties):
            for field in problem_classes.DetectClass(object).get_property_required(object['status']):
                self.VerifyField(object,field)
        else:
            print 'Unrecognized collection'
            sys.exit(0)

    def FormJson(self,collection,object):
        if type(object) is str:
            object = json.load(open(object))
        self.Sign(collection,object)
        self.Verify(collection,object)
        return object

    def Commit(self,collection,object):
        object = self.FormJson(collection,object)
        collection.insert_one(object)
        return object['_id']

    def CommitMany(self,collection,objects):
        _ids = []
        for object in objects:
            object = self.FormJson(collection,object)
            object['_id'] = object['_id'] + len(_ids)
            _ids.append(object['_id'])
        collection.insert_many(objects)
        return _ids

    def CommitModel(self,object):
        return self.Commit(self.models,object)

    def CommitModels(self,objects):
        return self.CommitMany(self.models,objects)

    def CommitExecutable(self,object):
        return self.Commit(self.executables,object)

    def CommitExecutables(self,objects):
        return self.CommitMany(self.executables,objects)

    def CommitProperty(self,object):
        return self.Commit(self.properties,object)

    def CommitProperties(self,objects):
        return self.CommitMany(self.properties,objects)

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

    def FormProperty(self,class_name,model_id,executable_id,status,seed,params):
        return {'class':class_name,'owner':self.user,'executable_id':executable_id,'model_id':model_id,'status':status,'seed':seed,'params':params}

    def RealTimeHist(self,filter,target,nbins=1000,frames=10000,interval=100):
        fig = plt.figure()
        ax = fig.add_subplot(1, 1, 1)
        filter['status'] = 3
        up = UpdatePlot(ax, self.properties, filter, target, nbins)
        anim = FuncAnimation(fig, up, frames=frames, init_func=up.init, interval=interval, blit=False)
        plt.show()
