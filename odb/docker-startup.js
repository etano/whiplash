db.createUser({user:"www",pwd:"7cJgeAkHdw{oktPNYdgYE3nJ",roles:[{role:"readWrite",db:"wdb"}]});
db.createUser({user:"api",pwd:"haYrv{Ak9UJiaDsqVTe7rLJTc",roles:[{role:"readWrite",db:"wdb"}]});
db.createUser({user:"pwn",pwd:"cftXzdrjheHEARuJKT39x]3sV",roles:[{role:"dbOwner",db:"wdb"}]});
db.createUser({user:"scheduler",pwd:"c93lbcp0hc[5209sebf10{3ca",roles:[{role:"read",db:"wdb"}]});
db.fs.files.createIndex({md5 : 1, "metadata.property_id" : 1},{unique : true});
db.executables.createIndex({name : 1, algorithm : 1, version : 1, build : 1},{unique : true});
db.properties.createIndex({input_model_id : 1, executable_id : 1, params : 1},{unique : true});
db.setProfilingLevel(2)
