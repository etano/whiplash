import sys, json
if sys.version_info[0] < 3: import httplib
else: import http.client as httplib

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
        username = raw_input("username: ")
        password = raw_input("password: ")
        client_id = raw_input("client ID: ")
        client_secret = raw_input("client secret: ")

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
        client_id = raw_input("client ID: ")
        client_secret = raw_input("client secret: ")

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

        def commit(self,objects):
            if not isinstance(objects, list):
                objects = [objects]
            status, reason, res = self.db.request("POST","/api/"+self.name+"/commit/",json.dumps(objects))
            return json.loads(res.decode('utf-8'))["ids"]

        #
        # Query
        #

        def query(self,filter):
            status, reason, res = self.db.request("GET","/api/"+self.name+"/query/",json.dumps(filter))
            return json.loads(res.decode('utf-8'))["objs"]

        def query_by_id(self,id):
            status, reason, res = self.db.request("GET","/api/"+self.name+"/query/"+str(id),{})
            return json.loads(res.decode('utf-8'))["obj"]

        def query_for_ids(self,filter):
            ids = []
            for res in self.query(filter):
                ids.append(res['_id'])
            return ids

        #
        # Update
        #

        def find_one_and_update(self,filter,update):
            status, reason, res = self.db.request("PUT","/api/"+self.name+"/update/",json.dumps({'filter':filter,'update':object}))
            return json.loads(res.decode('utf-8'))["obj"]

        def update_by_id(self,id,object):
            status, reason, res = self.db.request("PUT","/api/"+self.name+"/update/"+str(id),json.dumps(object))
            return json.loads(res.decode('utf-8'))["obj"]

        #
        # Delete
        #

        def delete(self,filter):
            status, reason, res = self.db.request("DELETE","/api/"+self.name+"/delete/",json.dumps(filter))
            return json.loads(res.decode('utf-8'))

        def delete_by_id(self,id):
            status, reason, res = self.db.request("DELETE","/api/"+self.name+"/delete/"+str(id),{})
            return json.loads(res.decode('utf-8'))

        def delete_by_ids(self,ids):
            return self.delete({'_id': { '$in': ids }})

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

        def form(self,class_name,model_id,executable_id,status,seed,params):
            return {'class':class_name,'executable_id':executable_id,'model_id':model_id,'status':status,'seed':seed,'params':params}

        def get_unresolved(self):
            return self.find_one_and_update({'status':0},{'status':1})

        def commit_resolved(self,object):
            return self.update_by_id(object["_id"],object)

        def update_status(self,id,status):
            return self.update_by_id(id,{'status':status})
