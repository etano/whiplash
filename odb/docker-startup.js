db.createUser({user:"www",pwd:"7cJgeAkHdw{oktPNYdgYE3nJ",roles:[{role:"readWrite",db:"wdb"}]});
db.createUser({user:"api",pwd:"haYrv{Ak9UJiaDsqVTe7rLJTc",roles:[{role:"readWrite",db:"wdb"}]});
db.createUser({user:"pwn",pwd:"cftXzdrjheHEAR!JKT(>>,V",roles:[{role:"dbOwner",db:"wdb"}]});
db.models.createIndex({class : 1, checksum : 1},{unique : true});
db.executables.createIndex({class : 1, name : 1, algorithm : 1, version : 1, build : 1},{unique : true});
db.properties.createIndex({model_id : 1,executable_id : 1, params : 1},{unique : true});
