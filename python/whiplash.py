import sys,json,time,zlib,math,os,getpass,requests

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

        try:
            res = requests.request(protocol,'https://' + self.server + ':' + str(self.port) + uri,data=payload,headers=self.headers)
        except:
            res = requests.request(protocol,'http://' + self.server + ':' + str(self.port) + uri,data=payload,headers=self.headers)

        if res.status_code != 200:
            print(res.status_code, res.reason, res.content)

        return res.status_code, res.reason, res.content

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
    # Check status
    #

    def check_status(self,tags={},params={}):
        '''
        checks how many properties are {unresolved, pulled, timed out, resolved, errored}
        '''
        in_model_ids = self.models.query_fields_only(tags,"_id")["_id"]
        filter = {"input_model_id":{"$in":in_model_ids}}
        for key in params:
            filter["params."+key] = params[key]
        filter["status"] = "unresolved"
        print('unresolved: %d'%(self.properties.count(filter)))
        filter["status"] = "pulled"
        print('pulled: %d'%(self.properties.count(filter)))
        filter["status"] = "running"
        print('running: %d'%(self.properties.count(filter)))
        filter["status"] = "timed out"
        print('timed out: %d'%(self.properties.count(filter)))
        filter["status"] = "resolved"
        print('resolved: %d'%(self.properties.count(filter)))
        filter["status"] = "errored"
        print('errored: %d'%(self.properties.count(filter)))
        filter["status"] = "not found"
        print('not found: %d'%(self.properties.count(filter)))

    #
    # Get results
    #

    def get_inputs_outputs(self,tags,params):
        '''
        fetches input and output models corresponding to the models and properties found by their respective filters
        '''
        in_model_ids = self.models.query_fields_only(tags,"_id")["_id"]
        filter = {"status":"resolved","input_model_id":{"$in":in_model_ids}}
        for key in params:
            filter["params."+key] = params[key]

        all_ids = self.properties.query_fields_only(filter,["input_model_id","output_model_id","_id"])
        in_model_ids = all_ids["input_model_id"]
        out_model_ids = all_ids["output_model_id"]

        in_models = self.models.query({'_id': {'$in': in_model_ids}})
        out_models = self.models.query({'_id': {'$in': out_model_ids}})
        inputs = []
        outputs = []
        for j in range(len(in_model_ids)):
            in_model = {}
            for i in range(len(in_models)):
                if in_models[i]['_id'] == in_model_ids[j]:
                    in_model = in_models[i]
                    break
            inputs.append(in_model)
            out_model = {}
            for i in range(len(out_models)):
                if out_models[i]['_id'] == out_model_ids[j]:
                    out_model = out_models[i]
                    break
            outputs.append(out_model)
        return inputs,outputs

    def get_results(self,tags,params):
        '''
        fetches output models corresponding to the models and properties found by their respective filters
        '''
        in_model_ids = self.models.query_fields_only(tags,"_id")["_id"]
        filter = {"status":"resolved","input_model_id":{"$in":in_model_ids}}
        for key in params:
            filter["params."+key] = params[key]

        all_ids = self.properties.query_fields_only(filter,["output_model_id","_id"])
        out_model_ids = all_ids["output_model_id"]
        prop_ids = all_ids["_id"]

        out_models = self.models.query({'_id': {'$in': out_model_ids}})
        results = [{} for i in range(len(out_model_ids))]
        for out_model_id in out_model_ids:
            out_model = {}
            for i in range(len(out_models)):
                if out_models[i]['_id'] == out_model_id:
                    out_model = out_models[i]
                    break
            for i in range(len(prop_ids)):
                if out_model["property_id"] == prop_ids[i]:
                    results[i] = out_model['content']
                    break
        return results

    def get_results_fields(self,tags,params,fields):
        '''
        fetches output models corresponding to the models and properties found by their respective filters
        '''
        in_model_ids = self.models.query_fields_only(tags,"_id")["_id"]
        filter = {"status":"resolved","input_model_id":{"$in":in_model_ids}}
        for key in params:
            filter["params."+key] = params[key]

        out_model_ids = self.properties.query_fields_only(filter,"output_model_id")["output_model_id"]

        return self.models.query_fields_only({'_id': {'$in': out_model_ids}},fields)

    #
    # Submit query
    #

    def submit_query(self,model_filter,executable_filter,params):
        '''
        submits a query to the database
        '''
        status, reason, res = self.request("POST","/api/query",json.dumps({"model_filter":model_filter,"executable_filter":executable_filter,"params":params}))
        print(status)
        print(reason)
        print(res)

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
                sys.exit(1)
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
            tmp = self.request("GET","/api/"+self.name+"/fields/",{'filter':fltr,'fields':fields})
            if self.name == 'models':
                res = {}
                for field in fields:
                    res[field] = []
                    for o in tmp:
                        res[field].append(o[field])
                return res
            else:
                res = {}
                for field in fields:
                    res[field] = []
                    for o in tmp:
                        tmp0 = o
                        for f in field.split('.'):
                            tmp0 = tmp0[f]
                        res[field].append(tmp0)
                return res                        

        def query_id(self,ID):
            '''
            fetches the object in the collection which has the id
            '''
            return self.request("GET","/api/"+self.name+"/id/"+str(ID),{})

        #
        # Find and update
        #

        def update(self,fltr,update):
            '''
            updates the objects in the collection which satisfy the filter as specified in the update
            '''
            return self.request("PUT","/api/"+self.name+"/",{'filter':fltr,'update':update})


        def find_one_and_update(self,fltr,update):
            '''
            fetches a single object in the collection which satisfies the filter and updates it as specified in the update
            '''
            return self.request("PUT","/api/"+self.name+"/one/",{'filter':fltr,'update':update})

        def find_id_and_update(self,ID,update):
            '''
            fetches the object in the collection which has the id and updates it as specified in the update
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

        def mapreduce(self,fltr,mapper,reducer,finalizer):
            '''
            Performs a custom computation on the data, by performing a mapreduce operation.
            Custom map(), reduce(key,value) and finalize(key,value) functions have to be a string of a JS function.
            
            For usage of MongoDB mapreduce see mongoDB Documentation: https://docs.mongodb.org/manual/reference/command/mapReduce/#dbcmd.mapReduce

            Sample mapper:
            var map = function () {
                emit(this.owner,
                     {sum: this["walltime"],
                      max: this["walltime"],
                      min: this["walltime"],
                      count: 1,
                      diff: 0
                     });
            };
            Sample reducer:
            var reduce = function (key, values) {
                var a = values[0];
                for (var i=1; i < values.length; i++){
                    var b = values[i];
                    var delta = a.sum/a.count - b.sum/b.count;
                    var weight = (a.count * b.count)/(a.count + b.count);
                    a.diff += b.diff + delta*delta*weight;
                    a.sum += b.sum;
                    a.count += b.count;
                    a.min = Math.min(a.min, b.min);
                    a.max = Math.max(a.max, b.max);
                }
                return a;
            };
            var finalize = function (key, value){
                value.mean = value.sum / value.count;
                value.variance = value.diff / value.count;
                value.stddev = Math.sqrt(value.variance);
                return value;
            };
            '''
            return self.request("GET","/api/"+self.name+"/mapreduce/",{"filter":fltr,"map":mapper,"reduce":reducer,"finalize":finalizer})


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

        def replace(self,replacements):
            '''
            replaces objects in the collection with the replacements
            '''
            return self.request("PUT","/api/properties/replace/",replacements)

        def refresh(self):
            '''
            relaunches the properties which are timed out with double the timeout
            '''
            print(self.request("PUT","/api/properties/refresh/",{}))
