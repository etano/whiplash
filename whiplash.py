import sys, httplib, json

# Whiplash class
class wdb:
    def __init__(self,server,port,access_token=""):
        self.server = server
        self.port = port
        self.access_token = access_token
        if self.access_token == "":
            print 'Please input proper access token'
            sys.exit()
        else:
            status, reason, res = self.Request("GET","/api",json.dumps({"foo":"bar"}))
            if status != 200:
                sys.exit()
        self.models = "models"
        self.executables = "executables"
        self.properties = "properties"

    def Request(self,protocol,uri,payload):
        conn = httplib.HTTPConnection(self.server,self.port)
        headers = {"Content-type": "application/json", "Accept": "*/*", "Authorization":"Bearer "+self.access_token}
        conn.request(protocol,uri,payload,headers)
        res = conn.getresponse()
        if res.status != 200:
            print res.status, res.reason
        return res.status, res.reason, json.loads(res.read())

    def InsertMany(self,collection,objects):
        status, reason, res = self.Request("POST","/api/"+collection,json.dumps(objects))
        return res["ids"]

    def InsertOne(self,collection,object):
        return self.InsertMany(collection,[object])[0]

    def DeleteMany(self,collection,objects):
        status, reason, res = self.Request("DELETE","/api/"+collection,json.dumps(objects))
        return res

    def Find(self,collection,filter):
        status, reason, res = self.Request("GET","/api/"+collection,json.dumps(filter))
        return res["objs"]

    def FormJson(self,collection,object):
        if type(object) is str:
            object = json.load(open(object))
        return object

    def Commit(self,collection,object):
        object = self.FormJson(collection,object)
        return self.InsertOne(collection,object)

    def CommitMany(self,collection,objects):
        for object in objects:
            object = self.FormJson(collection,object)
        return self.InsertMany(collection,objects)

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

    def HoldUntilResolved(self,property_ids,fraction):
        #TODO: if more efficient, fetch by unique tag for a given set
        #of jobs rather than array of ids
        while True:
            properties = self.Find(self.properties,{'_id': { '$in': property_ids },'status':3})
            if properties.count() > fraction*len(property_ids): break
        return properties

    def Query(self,collection,filter):
        ids = []
        for res in self.Find(collection,filter):
            ids.append(res['_id'])
        return ids

    def QueryModels(self,filter):
        return self.Query(self.models,filter)

    def QueryExecutables(self,filter):
        return self.Query(self.executables,filter)

    def QueryProperties(self,filter):
        return self.Query(self.properties,filter)

    def Fetch(self,collection,id):
        return self.FindOne(collection,{'_id':id})

    def FetchModel(self,id):
        return self.Fetch(self.models,id)

    def FetchExecutable(self,id):
        return self.Fetch(self.executables,id)

    def FetchProperty(self,id):
        return self.Fetch(self.properties,id)

    def DeleteProperties(self,ids):
        return self.DeleteMany(self.properties,{'_id': { '$in': ids }})

    def FormProperty(self,class_name,model_id,executable_id,status,seed,params):
        return {'class':class_name,'executable_id':executable_id,'model_id':model_id,'status':status,'seed':seed,'params':params}
