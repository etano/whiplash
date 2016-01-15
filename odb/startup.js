try{ db.createUser({user:"www",pwd:"7cJgeAkHdw{oktPNYdgYE3nJ",roles:[{role:"readWrite",db:"wdb"}]}); } catch(err) {}
try{ db.createUser({user:"api",pwd:"haYrv{Ak9UJiaDsqVTe7rLJTc",roles:[{role:"readWrite",db:"wdb"}]}); } catch(err) {}
try{ db.createUser({user:"pwn",pwd:"cftXzdrjheHEARuJKT39x]3sV",roles:[{role:"dbOwner",db:"wdb"}]}); } catch(err) {}
try{ db.createUser({user:"scheduler",pwd:"c93lbcp0hc[5209sebf10{3ca",roles:[{role:"read",db:"wdb"}]}); } catch(err) {}
try{ db.fs.files.createIndex({md5 : 1, "metadata.property_id" : 1, "metadata.owner" : 1},{unique : true}); } catch(err) {}
try{ db.executables.createIndex({name : 1, algorithm : 1, version : 1, build : 1, owner : 1},{unique : true}); } catch(err) {}
try{ db.properties.createIndex({input_model_id : 1, executable_id : 1, md5 : 1, owner : 1},{unique : true}); } catch(err) {}
try{ db.properties.createIndex({status : 1},{unique : false}); } catch(err) {}
try{ db.queries.createIndex({owner : 1, "filters": 1, "fields": 1},{unique : true}); } catch(err) {}
try{ db.collaborations.createIndex({name : 1},{unique : true}); } catch(err) {}
try{ db.users.createIndex({username : 1},{unique : true}); } catch(err) {}
try{ db.clients.createIndex({name : 1},{unique : true}); } catch(err) {}
try{ db.work_batches.createIndex({timestamp : 1}); } catch(err) {}
try{ db.setProfilingLevel(2); } catch(err) {}
