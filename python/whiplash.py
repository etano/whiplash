import sys,json,time,zlib,math,os,getpass,requests

try: input = raw_input
except NameError: pass

class connection:
    '''
    interface to the whiplash database
    '''

    def __init__(self,server,port,token="",username="",password="",save_token=True):
        '''
        initialises the whiplash class. server and port required
        '''
        self.server = server
        self.port = port
        self.headers = {"Accept": "*/*"}
        self.save_token = save_token
        if token == "":
            if username == "":
                self.read_config()
            else:
                self.create_token(username,password)
        else:
            self.set_token(token)
        self.check_token()

    def request(self,protocol,uri,payload,zip=False):
        '''
        makes http request to the whiplash API server
        '''
        if zip:
            payload = zlib.compress(payload)
            self.headers["Content-type"] = "gzip"
        else:
            self.headers["Content-type"] = "application/json"
        uri = self.server + ':' + str(self.port) + '/api/' + uri
        try:
            t0 = time.time()
            res = requests.request(protocol, 'https://'+uri, data=payload, headers=self.headers)
            t1 = time.time()
            #print('request time',t1-t0)
        except:
            t0 = time.time()
            res = requests.request(protocol, 'http://'+uri, data=payload, headers=self.headers)
            t1 = time.time()
            #print('request time',t1-t0)

        if res.status_code != 200:
            print(res.status_code, res.reason, res.content)

        return res.status_code, res.reason, res.content

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
            self.create_token()

    def check_token(self):
        '''
        checks if token in valid 
        '''
        status, reason, res = self.request("GET", "", json.dumps({}))
        if status != 200:
            if 'Unauthorized' in reason:
                print('Token not valid. Please create one.')
                self.create_token()

    def create_token(self,username="",password="",client_id="",client_secret=""):
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

        status, reason, res = self.request("POST", "users/token", json.dumps({"grant_type":"password","client_id":client_id,"client_secret":client_secret,"username":username,"password":password}))
        if status != 200:
            if ('Unauthorized' in reason) or ('Forbidden' in reason):
                print('Invalid login credentials. Please verify your account.')
            sys.exit(1)
        else:
            res = json.loads(res.decode('utf-8'))
            if self.save_token:
                print("New tokens grant for", res["expires_in"], "seconds saved to ~/.whiplash_config .")
                f = open(os.path.expanduser("~")+"/.whiplash_config","w")
                f.write(res["access_token"])
                f.close()
                self.set_token(res["access_token"])

class collection:
    '''
    base class for models, executables and properties collections
    '''
    def __init__(self,db,name):
        '''
        initialises a collection with the database and collection name
        '''
        self.db = db
        self.name = name

    def request(self,protocol,uri,payload):
        '''
        wrappers http request to the API server with some convenience
        '''
        t0 = time.time()
        response = self.db.request(protocol, self.name+"/"+uri, payload)
        t1 = time.time()
        #print('collection request time',t1-t0)
        return response

    def commit(self,objs):
        '''
        commits a single or multiple objects to collection
        '''
        if not isinstance(objs, list):
            objs = [objs]
        return self.request("POST", "", objs)

    def count(self,filter):
        '''
        counts the number of objects in the colleciton which satisfy the filter
        '''
        return self.request("GET", "count", filter)

    def query(self,filter,fields=[]):
        '''
        Fetches specified fields of objects in the collection which satisfy the filter.
        If no fields are specified, then returns the whole objects.
        '''
        if not isinstance(fields, list):
            fields = [fields]
        return self.request("GET", "", {"fields":fields,"filter":filter})

    def update(self,filter,update):
        '''
        updates the objects in the collection which satisfy the filter as specified in the update
        '''
        return self.request("PUT", "", {'filter':filter,'update':update})

    def replace(self,replacements):
        '''
        replaces objects in the collection with the replacements
        '''
        return self.request("PUT", "replace", replacements)

    def delete(self,filter):
        '''
        deletes the objects in the collection which satisfy the filter
        '''
        return self.request("DELETE", "", filter)

    def stats(self,field,filter):
        '''
        computes the {sum, max, min, count, mean, standard deviation, variance} of the 
        specified fields of objects in the collection which satisfy the filter 
        '''
        return self.request("GET", "stats", {"field":field,"filter":filter})

    def mapreduce(self,filter,mapper,reducer,finalizer):
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
        return self.request("GET", "mapreduce", {"filter":filter, "map":mapper, "reduce":reducer, "finalize":finalizer})

class properties_collection(collection):

    def refresh(self):
        '''
        relaunches the properties which are timed out with double the timeout
        '''
        print(self.request("PUT", "refresh", {}))

class db:
    '''
    interface to the whiplash database
    '''

    def __init__(self, server, port, token="", username="", password="", save_token=True):
        self.conn = connection(server,port,token=token,username=username,password=password,save_token=save_token)
        self.models = self.collection("models")
        self.executables = self.collection("executables")
        self.properties = properties_collection(self,"properties")
        self.queries = self.collection("queries")

    def request(self, protocol, uri, payload):
        '''
        Wraps http request to the API server with some convenience
        '''
        t0 = time.time()
        req = json.dumps(payload)
        t1 = time.time()
        #print('serialization time',t1-t0)
        status, reason, res = self.conn.request(protocol, uri, req)
        if status == 200 or status == 'OK':
            t0 = time.time()
            res = json.loads(res.decode('utf-8'))["result"]
            t1 = time.time()
            #print('deserialization time',t1-t0)
            return res
        else:
            print(status,reason,res)
            sys.exit(1)

    def query(self, filters, fields={}, settings={}):
        '''
        Submits a query to the database
        '''
        t0 = time.time()
        res = self.request("GET", "queries", {"filters":filters,"fields":fields,"settings":settings})
        t1 = time.time()
        #print('query time',t1-t0)
        return res

    def poll(self, filters, fields={}, settings={}, freq=1):
        '''
        Blocks until query is satisfied
        '''
        self.query(filters, fields, settings)
        while True:
            status = self.status(filters,fields)
            if status['unresolved'] == 0 and status['running'] == 0 and status['pulled'] == 0:
                break
            time.sleep(freq)
        return self.query(filters, fields, settings)

    def status(self, filters, fields):
        '''
        Checks how many properties are {unresolved, pulled, running, timed out, resolved, errored}
        '''
        return self.request("GET", "queries/status", {"filters":filters,"fields":fields})

    def collection(self, name):
        return collection(self, name)
