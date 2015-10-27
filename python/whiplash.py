import sys,json,time,zlib,math

if sys.version_info[0] < 3: import httplib
else: import http.client as httplib

try: input = raw_input
except NameError: pass

#
# Whiplash class
#
class wdb:
    def __init__(self,server,port,access_token="",username="",password="",client_id="",client_secret=""):
        self.server = server
        self.port = port
        self.headers = {"Accept": "*/*"}
        if access_token == "":
            self.create_token(username,password,client_id,client_secret)
        else:
            self.set_token(access_token)
        self.check_token()

        self.models = self.collection(self,"models")
        self.executables = self.collection(self,"executables")
        self.properties = self.properties_collection(self,"properties")

    #
    # Request
    #

    def request(self,protocol,uri,payload,zip=False):
        if zip:
            payload = zlib.compress(payload)
            self.headers["Content-type"] = "gzip"
        else:
            self.headers["Content-type"] = "application/json"
        conn = httplib.HTTPSConnection(self.server,self.port)
        try:
            conn.request(protocol,uri,payload,self.headers)
        except:
            conn = httplib.HTTPConnection(self.server,self.port)
            conn.request(protocol,uri,payload,self.headers)
        res = conn.getresponse()
        if res.status != 200:
            print(res.status, res.reason, res.read())
        return res.status, res.reason, res.read()

    #
    # Tokens
    #

    def set_token(self,access_token):
        self.access_token = access_token
        self.headers["Authorization"] = "Bearer "+self.access_token

    def check_token(self):
        status, reason, res = self.request("GET","/api",json.dumps({"foo":"bar"}))
        if status != 200:
            if 'Unauthorized' in reason:
                print('Token not valid. Please create one.')
            sys.exit(1)

    def create_token(self,username="",password="",client_id="",client_secret=""):
        if username == "":
            username = input("username: ")
        if password == "":
            password = input("password: ")
        if client_id == "":
            client_id = input("client ID: ")
        if client_secret == "":
            client_secret = input("client secret: ")

        status, reason, res = self.request("POST","/api/users/token",json.dumps({"grant_type":"password","client_id":client_id,"client_secret":client_secret,"username":username,"password":password}))
        if status != 200:
            if ('Unauthorized' in reason) or ('Forbidden' in reason):
                print('Invalid login credentials. Please verify your account.')
            sys.exit(1)
        else:
            res = json.loads(res.decode('utf-8'))
            print("New tokens grant for", res["expires_in"], "seconds. Please save them.")
            print("access token:", res["access_token"])
            print("refresh token:", res["refresh_token"])
            self.set_token(res["access_token"])

    def refresh_token(self,refresh_token):
        client_id = input("client ID: ")
        client_secret = input("client secret: ")

        self.headers.pop("Authorization")
        status, reason, res = self.request("POST","/api/users/token",json.dumps({"grant_type":"refresh_token","client_id":client_id,"client_secret":client_secret,"refresh_token":refresh_token}))
        if status != 200:
            if ('Unauthorized' in reason) or ('Forbidden' in reason):
                print('Invalid refresh token. Please create new tokens.')
            sys.exit(1)
        else:
            res = json.loads(res.decode('utf-8'))
            print("New tokens grant for", res["expires_in"], "seconds. Please save them.")
            print("access token:", res["access_token"])
            print("refresh token:", res["refresh_token"])
            self.set_token(res["access_token"])

    #
    # Collections
    #
    class collection:
        def __init__(self,db,name):
            self.name = name
            self.db = db

        #
        # Commit
        #

        def commit(self,objs):
            if not isinstance(objs, list):
                objs = [objs]
            status, reason, res = self.db.request("POST","/api/"+self.name+"/",json.dumps(objs))
            return json.loads(res.decode('utf-8'))["count"]

        #
        # Query
        #

        def count(self,fltr):
            status, reason, res = self.db.request("GET","/api/"+self.name+"/count/",json.dumps(fltr))
            return json.loads(res.decode('utf-8'))["count"]

        def query(self,fltr):
            status, reason, res = self.db.request("GET","/api/"+self.name+"/",json.dumps(fltr))
            return json.loads(res.decode('utf-8'))["objs"]

        def query_one(self,fltr):
            status, reason, res = self.db.request("GET","/api/"+self.name+"/one/",json.dumps(fltr))
            return json.loads(res.decode('utf-8'))["obj"]

        def query_field_only(self,field,fltr):
            status, reason, res = self.db.request("GET","/api/"+self.name+"/field/"+field,json.dumps(fltr))
            return json.loads(res.decode('utf-8'))["objs"]

        def query_id(self,ID):
            status, reason, res = self.db.request("GET","/api/"+self.name+"/id/"+str(ID),{})
            return json.loads(res.decode('utf-8'))["obj"]

        #
        # Find and update
        #

        def find_one_and_update(self,fltr,update):
            status, reason, res = self.db.request("POST","/api/"+self.name+"/one/",json.dumps({'filter':fltr,'update':update}))
            return json.loads(res.decode('utf-8'))["obj"]

        def find_id_and_update(self,ID,update):
            status, reason, res = self.db.request("POST","/api/"+self.name+"/id/"+str(ID),json.dumps(update))
            return json.loads(res.decode('utf-8'))["obj"]

        #
        # Update
        #

        def update(self,fltr,update):
            status, reason, res = self.db.request("PUT","/api/"+self.name+"/",json.dumps({'filter':fltr,'update':update}))
            return json.loads(res.decode('utf-8'))["count"]

        def update_one(self,fltr,update):
            status, reason, res = self.db.request("PUT","/api/"+self.name+"/one/",json.dumps({'filter':fltr,'update':update}))
            return json.loads(res.decode('utf-8'))["count"]

        def update_id(self,ID,update):
            status, reason, res = self.db.request("PUT","/api/"+self.name+"/id/"+str(ID),json.dumps(update))
            return json.loads(res.decode('utf-8'))["count"]

        #
        # Delete
        #

        def delete(self,fltr):
            status, reason, res = self.db.request("DELETE","/api/"+self.name+"/",json.dumps(fltr))
            return json.loads(res.decode('utf-8'))["count"]

        def delete_id(self,ID):
            status, reason, res = self.db.request("DELETE","/api/"+self.name+"/id/"+str(ID),{})
            return json.loads(res.decode('utf-8'))["count"]

    #
    # Special helper functions, only for properties
    #
    class properties_collection(collection):

        #TODO: check if commited property already exists and insert
        #with unresolved status if it does not. else return the
        #resolved property

        #TODO: statistics collections which are incrementally updated
        #through mapreduce when user commits to database, properties
        #are resolved, etc.

        #TODO: all executables inside docker containers specified in
        #"path". pull each container before submitting job

        #
        # Job schedulig
        #

        def hold_until_resolved(self,property_ids,fraction):
            while True:
                properties = self.query({'_id': { '$in': property_ids },'status':3})
                if properties.count() > fraction*len(property_ids): break
            return properties

        def fetch_work_batch(self,time_limit):
            status, reason, res = self.db.request("PUT","/api/properties/work_batch/",json.dumps({'time_limit':time_limit}))
            return json.loads(res.decode('utf-8'))["objs"]

        def get_unresolved(self,time_limit,batch=True):
            if batch:
                properties = self.fetch_work_batch(time_limit)
            else:
                properties = [self.find_one_and_update({'status':0},{'status':1})]

            model_ids = set()
            executable_ids = set()
            for prop in properties:
                model_ids.add(prop['model_id'])
                executable_ids.add(prop['executable_id'])
            models = self.db.models.query({'_id': { '$in': list(model_ids) }})
            executables = self.db.executables.query({'_id': { '$in': list(executable_ids) }})

            objs = []
            for prop in properties:
                obj = {'property':prop,'model_index':-1,'executable_index':-1}
                for i in range(len(models)):
                    if prop['model_id'] == models[i]['_id']:
                        obj['model_index'] = i
                        break
                for i in range(len(executables)):
                    if prop['executable_id'] == executables[i]['_id']:
                        obj['executable_index'] = i
                        break
                objs.append(obj)

            return [objs,models,executables]

        def commit_resolved(self,props,batch=True):
            if batch:
                IDs = []
                for prop in props:
                    IDs.append(prop["_id"])
                self.delete({'_id': { '$in': IDs }})
                self.commit(props)
            else:
                for prop in props:
                    self.update_id(prop["_id"],prop)

        def refresh(self):
            self.update({'status':1,'resolve_by':{'$lt':math.ceil(time.time())}},{'status':0,'resolve_by':-1})

        def submit(self,model,executable,props,by_id=False):
            if not by_id: self.db.models.commit(model)
            model_ids = self.db.models.query_field_only('_id',model)
            assert len(model_ids) == 1

            if not by_id: self.db.executables.commit(executable)
            executable_ids = self.db.executables.query_field_only('_id',executable)
            assert len(executable_ids) == 1

            for prop in props:
                prop["model_id"] = model_ids[0]
                prop["executable_id"] = executable_ids[0]

            self.commit(props)

        #
        # Statistics
        #

        def get_num_unresolved(self):
            return self.count({'status':0})

        def check_status(self):
            print(self.count({"status":0}),' | ',self.count({"status":1}),' | ',self.count({"status":2}),' | ',self.count({"status":3}))

        def get_unresolved_time(self):
            status, reason, res = self.db.request("GET","/api/properties/unresolved_time/",json.dumps({}))
            return json.loads(res.decode('utf-8'))["result"]

        def get_average_mistime(self):
            status, reason, res = self.db.request("GET","/api/properties/average_mistime/",json.dumps({}))
            return json.loads(res.decode('utf-8'))["result"]
