import httplib, json

conn = httplib.HTTPConnection('localhost',1337)
params = {"grant_type":"password", "client_id":"android", "client_secret":"SomeRandomCharsAndNumbers", "username":"myapi", "password":"abc1234"}
headers = {"Content-type": "application/json", "Accept": "*/*"}
conn.request("POST","/api/oauth/token",json.dumps(params),headers)
resp = conn.getresponse()
print resp.status, resp.reason
print resp.read()
conn.close()
