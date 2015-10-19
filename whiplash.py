import sys, json
if sys.version_info[0] < 3: import httplib
else: import http.client as httplib    

# Whiplash class
class wdb:
    def __init__(self,server,port,access_token=""):
        self.server = server
        self.port = port
        self.models = "models"
        self.executables = "executables"
        self.properties = "properties"

        self.SetToken(access_token)
        self.CheckToken()

    def CheckToken(self):
        status, reason, res = self.Request("GET","/api",json.dumps({"foo":"bar"}))
        if status != 200:
            if 'Unauthorized' in reason:
                print('Token not valid. Please create one.')
                self.CreateToken()
            else:
                sys.exit()

    def CreateToken(self):
        username = raw_input("username: ")
        password = raw_input("password: ")
        client_id = raw_input("client ID: ")
        client_secret = raw_input("client secret: ")

        self.headers = {"Content-type": "application/json", "Accept": "*/*"}
        status, reason, res = self.Request("POST","/api/oauth/token",json.dumps({"grant_type":"password","client_id":client_id,"client_secret":client_secret,"username":username,"password":password}))
        if status != 200:
            if ('Unauthorized' in reason) or ('Forbidden' in reason):
                print('Invalid login credentials. Please go to http://whiplash.ethz.ch to verify your account.')
            sys.exit()
        else:
            res = json.loads(res.decode('utf-8'))
            print("New tokens grant for", res["expires_in"], "seconds. Please save them.")
            print("access token:", res["access_token"])
            print("refresh token:", res["refresh_token"])
            self.SetToken(res["access_token"])

    def Request(self,protocol,uri,payload):
        conn = httplib.HTTPConnection(self.server,self.port)
        conn.request(protocol,uri,payload,self.headers)
        res = conn.getresponse()
        if res.status != 200:
            print(res.status, res.reason)
        return res.status, res.reason, res.read()

    def SetToken(self,access_token):
        self.access_token = access_token
        self.headers = {"Content-type": "application/json", "Accept": "*/*", "Authorization":"Bearer "+self.access_token}

    def RefreshToken(self,refresh_token):
        client_id = raw_input("client ID: ")
        client_secret = raw_input("client secret: ")

        self.headers = {"Content-type": "application/json", "Accept": "*/*"}
        status, reason, res = self.Request("POST","/api/oauth/token",json.dumps({"grant_type":"refresh_token","client_id":client_id,"client_secret":client_secret,"refresh_token":refresh_token}))
        if status != 200:
            if ('Unauthorized' in reason) or ('Forbidden' in reason):
                print('Invalid refresh token. Please login to get new tokens.')
                self.CreateToken()
            sys.exit()
        else:
            res = json.loads(res.decode('utf-8'))
            print("New tokens grant for", res["expires_in"], "seconds. Please save them.")
            print("access token:", res["access_token"])
            print("refresh token:", res["refresh_token"])
            self.SetToken(res["access_token"])

    def InsertMany(self,collection,objects):
        status, reason, res = self.Request("POST","/api/"+collection,json.dumps(objects))
        return json.loads(res.decode('utf-8'))["ids"]

    def InsertOne(self,collection,object):
        return self.InsertMany(collection,[object])[0]

    def DeleteMany(self,collection,objects):
        status, reason, res = self.Request("DELETE","/api/"+collection,json.dumps(objects))
        return json.loads(res.decode('utf-8'))

    def Find(self,collection,filter):
        status, reason, res = self.Request("GET","/api/"+collection,json.dumps(filter))
        return json.loads(res.decode('utf-8'))["objs"]

    def FindById(self,collection,id):
        status, reason, res = self.Request("GET","/api/"+collection+"/"+str(id),{})
        return json.loads(res.decode('utf-8'))["obj"]

    def UpdateById(self,collection,id,object):
        status, reason, res = self.Request("PUT","/api/"+collection+"/"+str(id),json.dumps(object))
        return json.loads(res.decode('utf-8'))

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
        return self.FindById(collection,id)

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

    def GetUnresolvedProperty(self):
        #TODO: return an unresolved property. findOne
        pass

    def CommitResolvedProperty(self,object):
        #TODO: update resolved property. object contains replacement
        #fields. findByIdAndUpdate
        pass

    def UpdatePropertyStatus(self,id,status):
        #TODO: update status of property. findByIdAndUpdate
        pass
