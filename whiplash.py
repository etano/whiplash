import sys, json, time

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

    def request(self,protocol,uri,payload):
        conn = httplib.HTTPConnection(self.server,self.port)
        conn.request(protocol,uri,payload,self.headers)
        res = conn.getresponse()
        if res.status != 200:
            print(res.status, res.reason)
        return res.status, res.reason, res.read()

    #
    # Tokens
    #

    def set_token(self,access_token):
        self.access_token = access_token
        self.headers = {"Content-type": "application/json", "Accept": "*/*", "Authorization":"Bearer "+self.access_token}

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

        self.headers = {"Content-type": "application/json", "Accept": "*/*"}
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

        self.headers = {"Content-type": "application/json", "Accept": "*/*"}
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
            return json.loads(res.decode('utf-8'))["ids"]

        #
        # Query
        #

        def count(self,fltr):
            status, reason, res = self.db.request("GET","/api/"+self.name+"/count/",json.dumps(fltr))
            return json.loads(res.decode('utf-8'))["count"]

        def query(self,fltr):
            status, reason, res = self.db.request("GET","/api/"+self.name+"/",json.dumps(fltr))
            return json.loads(res.decode('utf-8'))["objs"]

        def query_field_only(self,field,fltr):
            status, reason, res = self.db.request("GET","/api/"+self.name+"/field/"+field,json.dumps(fltr))
            return json.loads(res.decode('utf-8'))["objs"]

        def query_id(self,ID):
            status, reason, res = self.db.request("GET","/api/"+self.name+"/id/"+str(ID),{})
            return json.loads(res.decode('utf-8'))["obj"]

        #
        # Update
        #

        def update(self,fltr,update):
            status, reason, res = self.db.request("PUT","/api/"+self.name+"/",json.dumps({'filter':fltr,'update':update}))
            return json.loads(res.decode('utf-8'))

        def update_one(self,fltr,update):
            status, reason, res = self.db.request("PUT","/api/"+self.name+"/one/",json.dumps({'filter':fltr,'update':update}))
            return json.loads(res.decode('utf-8'))["obj"]

        def update_id(self,ID,update):
            status, reason, res = self.db.request("PUT","/api/"+self.name+"/id/"+str(ID),json.dumps(update))
            return json.loads(res.decode('utf-8'))

        #
        # Delete
        #

        def delete(self,fltr):
            status, reason, res = self.db.request("DELETE","/api/"+self.name+"/",json.dumps(fltr))
            return json.loads(res.decode('utf-8'))

        def delete_id(self,ID):
            status, reason, res = self.db.request("DELETE","/api/"+self.name+"/id/"+str(ID),{})
            return json.loads(res.decode('utf-8'))

    #
    # Special helper functions, only for properties
    #
    class properties_collection(collection):

        def hold_until_resolved(self,property_ids,fraction):
            while True:
                properties = self.query({'_id': { '$in': property_ids },'status':"resolved"})
                if properties.count() > fraction*len(property_ids): break
            return properties

        def get_num_unresolved(self):
            return self.count({'status':"unresolved"})

        def fetch_work_batch(self,time_limit):
            status, reason, res = self.db.request("PUT","/api/properties/work_batch/",json.dumps({'time_limit':time_limit}))
            return json.loads(res.decode('utf-8'))["objs"]

        def get_unresolved(self,time_limit,batch=True):
            if batch:
                properties = self.fetch_work_batch(time_limit)
            else:
                properties = [self.update_one({'status':"unresolved"},{'status':"pulled"})]

            model_ids = []
            executable_ids = []
            for prop in properties:
                model_ids.append(prop['model_id'])
                executable_ids.append(prop['executable_id'])

            models = self.db.models.query({'_id': { '$in': model_ids }})
            executables = self.db.executables.query({'_id': { '$in': executable_ids }})

            objs = []
            for i in range(len(properties)):
                objs.append({'property':properties[i],'model':models[i],'executable':executables[i]})
            return objs

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

        def refresh_properties(self):
            self.update({'status':"pulled",'consume_by':{'$lt':time.time()}},{'status':"unresolved"})

