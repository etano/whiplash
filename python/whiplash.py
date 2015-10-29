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
            conn.request(protocol,uri,str(payload),self.headers)
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

        def request(self,protocol,uri,payload):
            status, reason, res = self.db.request(protocol,uri,json.dumps(payload))
            if status == 200:
                return json.loads(res.decode('utf-8'))["result"]
            else:
                print(status,reason,res)
                sys.exit(0)
        #
        # Commit
        #

        def commit(self,objs):
            if not isinstance(objs, list):
                objs = [objs]
            return self.request("POST","/api/"+self.name+"/",objs)

        #
        # Query
        #

        def count(self,fltr):
            return self.request("GET","/api/"+self.name+"/count/",fltr)

        def query(self,fltr):
            return self.request("GET","/api/"+self.name+"/",fltr)

        def query_one(self,fltr):
            return self.request("GET","/api/"+self.name+"/one/",fltr)

        def query_field_only(self,field,fltr):
            return self.request("GET","/api/"+self.name+"/field/"+field,fltr)

        def query_id(self,ID):
            return self.db.request("GET","/api/"+self.name+"/id/"+str(ID),{})

        #
        # Find and update
        #

        def find_one_and_update(self,fltr,update):
            return self.request("POST","/api/"+self.name+"/one/",{'filter':fltr,'update':update})

        def find_id_and_update(self,ID,update):
            return self.request("POST","/api/"+self.name+"/id/"+str(ID),update)

        #
        # Update
        #

        def update(self,fltr,update):
            return self.request("PUT","/api/"+self.name+"/",{'filter':fltr,'update':update})

        def batch_update(self,updates):
            return self.request("PUT","/api/"+self.name+"/batch",updates)

        def update_one(self,fltr,update):
            return self.request("PUT","/api/"+self.name+"/one/",{'filter':fltr,'update':update})

        def update_id(self,ID,update):
            return self.request("PUT","/api/"+self.name+"/id/"+str(ID),update)

        #
        # Delete
        #

        def delete(self,fltr):
            return self.request("DELETE","/api/"+self.name+"/",fltr)

        def delete_id(self,ID):
            return self.request("DELETE","/api/"+self.name+"/id/"+str(ID),{})

        #
        # Map-reduce
        #

        def total(self,field,filter):
            return self.request("GET","/api/"+self.name+"/total/",{"field":field,"filter":filter})

        def avg_per_dif(self,field1,field2,filter):
            return self.request("GET","/api/"+self.name+"/avg_per_dif/",{"field1":field1,"field2":field2,"filter":filter})

    #
    # Special helper functions, only for properties
    #
    class properties_collection(collection):

        #
        # Submit
        #

        def submit(self,model,executable,props,by_id=False):
            model_ids = []
            if "_id" in model:
                model_ids = [model["_id"]]
            else:
                if not by_id: self.db.models.commit(model)
                model_ids = self.db.models.query_field_only('_id',model)
                assert len(model_ids) == 1

            executable_ids = []
            if "_id" in executable:
                executable_ids = [executable["_id"]]
            else:
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

        def get_unresolved_time(self):
            return self.total("timeout",{"status":0})

        def get_resolved_time(self):
            return self.total("walltime",{"status":3})

        def get_average_mistime(self):
            return self.avg_per_dif("timeout","walltime",{"status":3})

        #
        # Testing
        #

        def refresh(self):
            self.update({'status':1,'resolve_by':{'$lt':math.ceil(time.time())}},{'status':0,'resolve_by':-1})

        def check_status(self):
            print('unresolved: %d'%(self.count({"status":0})))
            print('pulled: %d'%(self.count({"status":1})))
            print('timed out: %d'%(self.count({"status":2})))
            print('resolved: %d'%(self.count({"status":3})))
