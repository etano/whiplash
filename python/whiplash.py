import sys,json,time,zlib,math,os,getpass

if sys.version_info[0] < 3: import httplib
else: import http.client as httplib

try: input = raw_input
except NameError: pass

#
# Whiplash class
#
class wdb:
    '''
    interface to the whiplash database
    '''
    def __init__(self,server,port,token="",username="",password=""):
        '''
        initialises the whiplash class. server and port required
        '''
        self.server = server
        self.port = port
        self.headers = {"Accept": "*/*"}
        if token == "":
            if username == "":
                self.read_config()
            else:
                self.create_token(username,password,save_token=True)
        else:
            self.set_token(token)
        self.check_token()

        self.models = self.collection(self,"models")
        self.executables = self.collection(self,"executables")
        self.properties = self.properties_collection(self,"properties")
        self.work_batches = self.collection(self,"work_batches")
        self.jobs = self.collection(self,"jobs")
        self.collaborations = self.collection(self,"collaborations")
        self.users = self.collection(self,"users")
        self.accesstokens = self.collection(self,"accesstokens")

    #
    # Request
    #

    def request(self,protocol,uri,payload,zip=False):
        '''
        makes http request to the whiplash API server
        '''
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
        '''
        sets the access token
        '''
        self.access_token = access_token
        self.headers["Authorization"] = "Bearer "+self.access_token

    def read_config(self):
        '''
        reads access token from file if it exists
        '''
        try:
            f = open(os.path.expanduser("~")+"/.whiplash_config","r")
            token = f.readlines()[0].strip("\n")
            self.set_token(token)
        except:
            print('Whiplash config not found. Please enter your authorization details.')
            self.create_token(save_token=True)

    def check_token(self):
        '''
        checks if token in valid 
        '''
        status, reason, res = self.request("GET","/api",json.dumps({"foo":"bar"}))
        if status != 200:
            if 'Unauthorized' in reason:
                print('Token not valid. Please create one.')
                self.create_token(save_token=True)

    def create_token(self,username="",password="",client_id="",client_secret="",save_token=False):
        '''
        creates an access token using the username and password
        '''
        if username == "":
            username = input("username: ")
        if password == "":
            password = getpass.getpass("password: ")
        if client_id == "":
            client_id = username+"-python"
        if client_secret == "":
            client_secret = password

        status, reason, res = self.request("POST","/api/users/token",json.dumps({"grant_type":"password","client_id":client_id,"client_secret":client_secret,"username":username,"password":password}))
        if status != 200:
            if ('Unauthorized' in reason) or ('Forbidden' in reason):
                print('Invalid login credentials. Please verify your account.')
            sys.exit(1)
        else:
            res = json.loads(res.decode('utf-8'))
            if save_token:
                print("New tokens grant for", res["expires_in"], "seconds saved to ~/.whiplash_config .")
                f = open(os.path.expanduser("~")+"/.whiplash_config","w")
                f.write(res["access_token"])
                f.close()
                self.set_token(res["access_token"])

    #
    # Get results
    #

    def get_results(self,fltr):
        '''
        fetches output models corresponding to the properties found by the filter
        '''
        fltr['status'] = "resolved"
        result_ids = self.properties.query_fields_only(fltr,'output_model_id')['output_model_id']

        tmp = self.models.query({'_id': {'$in': result_ids}})
        results = []
        for result in tmp:
            results.append(result['content'])
        return results


    #
    # Collections
    #
    class collection:
        '''
        base class for models, executables and properties collections
        '''
        def __init__(self,db,name):
            '''
            initialises a collection with the database and collection name
            '''
            self.name = name
            self.db = db

        def request(self,protocol,uri,payload):
            '''
            wrappers http request to the API server with some convenience
            '''
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
            '''
            commits a single or multiple objects to collection
            '''
            if not isinstance(objs, list):
                objs = [objs]
            ids = self.request("POST","/api/"+self.name+"/",objs)
            if self.name == "properties" and len(ids) > 0:
                self.db.jobs.commit({"ids":ids,"submitted":1,"name":"default"})
            return ids

        #
        # Query
        #

        def count(self,fltr):
            '''
            counts the number of objects in the colleciton which satisfy the filter
            '''
            return self.request("GET","/api/"+self.name+"/count/",fltr)

        def query(self,fltr):
            '''
            fetches objects in the collection which satisfy the filter
            '''
            return self.request("GET","/api/"+self.name+"/",fltr)

        def query_one(self,fltr):
            '''
            fetches a single object in the collection which satisfies the filter
            '''
            return self.request("GET","/api/"+self.name+"/one/",fltr)

        def query_fields_only(self,fltr,fields):
            '''
            fetches only specified fields of objects which satisfy the filter
            '''
            if not isinstance(fields, list):
                fields = [fields]
            return self.request("GET","/api/"+self.name+"/fields/",{'filter':fltr,'fields':fields})

        def query_id(self,ID):
            '''
            fetches the object in the collection which has the id
            '''
            return self.request("GET","/api/"+self.name+"/id/"+str(ID),{})

        #
        # Find and update
        #

        def find_one_and_update(self,fltr,update):
            '''
            fetches a single object in the collection which satisfies the filter and updates 
            it as specified in the update
            '''
            return self.request("POST","/api/"+self.name+"/one/",{'filter':fltr,'update':update})

        def find_id_and_update(self,ID,update):
            '''
            fetches the object in the collection which has the id and updates it as 
            specified in the update
            '''
            return self.request("POST","/api/"+self.name+"/id/"+str(ID),update)

        #
        # Update
        #

        def update(self,fltr,update):
            '''
            updates the objects in the collection which satisfy the filter as specified in 
            the update
            '''
            return self.request("PUT","/api/"+self.name+"/",{'filter':fltr,'update':update})

        def replace_many(self,replacements):
            '''
            replaces objects in the collection with the replacements
            '''
            return self.request("PUT","/api/"+self.name+"/replacement",replacements)

        def update_one(self,fltr,update):
            '''
            updates a single object in the collection which satisfies the filter as specified
            in the update
            '''
            return self.request("PUT","/api/"+self.name+"/one/",{'filter':fltr,'update':update})

        def update_id(self,ID,update):
            '''
            updates the object in the collection which has the id as specified in the
            update
            '''
            return self.request("PUT","/api/"+self.name+"/id/"+str(ID),update)

        #
        # Delete
        #

        def delete(self,fltr):
            '''
            deletes the objects in the collection which satisfy the filter
            '''
            return self.request("DELETE","/api/"+self.name+"/",fltr)

        def delete_id(self,ID):
            '''
            deletes the object in the collection which has the id 
            '''
            return self.request("DELETE","/api/"+self.name+"/id/"+str(ID),{})

        #
        # Map-reduce
        #

        def stats(self,field,fltr):
            '''
            computes the {sum, max, min, count, mean, standard deviation, variance} of the 
            specified fields of objects in the collection which satisfy the filter 
            '''
            return self.request("GET","/api/"+self.name+"/stats/",{"field":field,"filter":fltr})


    #
    # Special helper functions, only for properties
    #
    class properties_collection(collection):

        def get_unresolved_time(self):
            '''
            computes the sum of timeouts of all unresolved properties
            '''
            return self.stats("timeout",{"status":"unresolved"})['sum']

        def get_resolved_time(self):
            '''
            computes the sum of timeouts of all resolved properties
            '''
            return self.stats("walltime",{"status":"resolved"})['sum']

        def check_status(self):
            '''
            checks how many properties are {unresolved, pulled, timed out, resolved, errored}
            '''
            print('unresolved: %d'%(self.count({"status":"unresolved"})))
            print('pulled: %d'%(self.count({"status":"pulled"})))
            print('timed out: %d'%(self.count({"status":"timed out"})))
            print('resolved: %d'%(self.count({"status":"resolved"})))
            print('errored: %d'%(self.count({"status":"errored"})))

        def refresh(self):
            '''
            revertes the statuses of pulled properties which never started for whatever reason
            '''
            # TODO: Make this do something
            self.update({'status':"pulled",'resolve_by':{'$lt':math.ceil(time.time())}},{'status':"unresolved",'resolve_by':-1})
