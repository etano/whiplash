import sys, json

if sys.version_info[0] < 3: import httplib
else: import http.client as httplib

try: input = raw_input
except NameError: pass

#
    # Whiplash class
#
class wdb:
    def __init__(self,server,port,access_token=""):
        self.server = server
        self.port = port
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
                self.create_token()
            else:
                sys.exit()

    def create_token(self):
        username = input("username: ")
        password = input("password: ")
        client_id = input("client ID: ")
        client_secret = input("client secret: ")

        self.headers = {"Content-type": "application/json", "Accept": "*/*"}
        status, reason, res = self.request("POST","/api/oauth/token",json.dumps({"grant_type":"password","client_id":client_id,"client_secret":client_secret,"username":username,"password":password}))
        if status != 200:
            if ('Unauthorized' in reason) or ('Forbidden' in reason):
                print('Invalid login credentials. Please go to http://whiplash.ethz.ch to verify your account.')
            sys.exit()
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
        status, reason, res = self.request("POST","/api/oauth/token",json.dumps({"grant_type":"refresh_token","client_id":client_id,"client_secret":client_secret,"refresh_token":refresh_token}))
        if status != 200:
            if ('Unauthorized' in reason) or ('Forbidden' in reason):
                print('Invalid refresh token. Please login to get new tokens.')
                self.create_token()
            sys.exit()
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
            status, reason, res = self.db.request("POST","/api/"+self.name+"/commit/",json.dumps(objs))
            return json.loads(res.decode('utf-8'))["ids"]

        #
        # Query
        #

        def query(self,fltr):
            status, reason, res = self.db.request("GET","/api/"+self.name+"/query/",json.dumps(fltr))
            return json.loads(res.decode('utf-8'))["objs"]

        def query_by_id(self,ID):
            status, reason, res = self.db.request("GET","/api/"+self.name+"/query/"+str(ID),{})
            return json.loads(res.decode('utf-8'))["obj"]

        def query_by_ids(self,IDs):
            status, reason, res = self.db.request("GET","/api/"+self.name+"/query_by_ids/",json.dumps(IDs))
            return json.loads(res.decode('utf-8'))["objs"]

        def query_for_ids(self,fltr):
            status, reason, res = self.db.request("GET","/api/"+self.name+"/query_for_ids/",json.dumps(fltr))
            return json.loads(res.decode('utf-8'))["ids"]

        def count(self,fltr):
            status, reason, res = self.db.request("GET","/api/"+self.name+"/count/",json.dumps(fltr))
            return json.loads(res.decode('utf-8'))["count"]

        #
        # Update
        #

        def find_one_and_update(self,fltr,update):
            status, reason, res = self.db.request("PUT","/api/"+self.name+"/update/",json.dumps({'filter':fltr,'update':update}))
            return json.loads(res.decode('utf-8'))["obj"]

        def update_by_id(self,ID,update):
            status, reason, res = self.db.request("PUT","/api/"+self.name+"/update/"+str(ID),json.dumps(update))
            return json.loads(res.decode('utf-8'))

        #
        # Delete
        #

        def delete(self,fltr):
            status, reason, res = self.db.request("DELETE","/api/"+self.name+"/delete/",json.dumps(fltr))
            return json.loads(res.decode('utf-8'))

        def delete_by_id(self,ID):
            status, reason, res = self.db.request("DELETE","/api/"+self.name+"/delete/"+str(ID),{})
            return json.loads(res.decode('utf-8'))

        def delete_by_ids(self,IDs):
            return self.delete({'_id': { '$in': IDs }})

    #
    # Special helper functions, only for properties
    #
    class properties_collection(collection):

        def hold_until_resolved(self,property_ids,fraction):
            #TODO: if more efficient, fetch by unique tag for a given set
            #of jobs rather than array of ids
            while True:
                properties = self.query(self.properties,{'_id': { '$in': property_ids },'status':3})
                if properties.count() > fraction*len(property_ids): break
            return properties

        def get_unresolved(self):
            return self.find_one_and_update({'status':0},{'status':1})

        def commit_resolved(self,obj):
            return self.update_by_id(obj["_id"],obj)

        def get_num_unresolved(self):
            return self.count({'status':0})

        def fetch_time_batch(self,time_limit):
            #TODO
            status, reason, res = self.db.request("PUT","/api/properties/fetch_time_batch/",json.dumps({'time_limit':time_limit}))
            return json.loads(res.decode('utf-8'))["objs"]

        def get_unresolved_batch(self,time_limit):
            properties = self.fetch_time_batch(time_limit)

            model_ids = []
            executable_ids = []
            for prop in properties:
                model_ids.append(prop['model_id'])
                executable_ids.append(prop['executable_id'])

            models = self.query_by_ids(model_ids)
            executables = self.query_by_ids(model_ids)

            objs = []
            for i in range(len(properties)):
                objs.append({'property':properties[i],'model':models[i],'executable':executables[i]})
            return objs

        def commit_resolved_batch(self,props):
            IDs = []
            for prop in props:
                IDs.append(prop["_id"])
            self.delete_by_ids(IDS)
            self.commit(props)
