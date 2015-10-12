import httplib, json

# Get token
conn = httplib.HTTPConnection('localhost',1337)
headers = {"Content-type": "application/json", "Accept": "*/*"}
params = {"grant_type":"password", "client_id":"android", "client_secret":"SomeRandomCharsAndNumbers", "username":"myapi", "password":"abc1234"}
conn.request("POST","/api/oauth/token",json.dumps(params),headers)
resp = conn.getresponse()
if 'OK' in resp.reason:
    r = json.loads(resp.read())
    access_token = r["access_token"]
    refresh_token = r["refresh_token"]
conn.close()

# Add executable
conn = httplib.HTTPConnection('localhost',1337)
headers = {"Content-type": "application/json", "Accept": "*/*", "Authorization":"Bearer "+access_token}
params = {'class':'ising', 'name':'NewArticle', 'description':'Lorem ipsum dolar sit amet', 'algorithm':'asdf', 'cfg':{'n_spins':10}, 'version':'1.0.0', 'build':'O3'}
conn.request("POST","/api/executables",json.dumps(params),headers)
resp = conn.getresponse()
print resp.status, resp.reason
print resp.read()
