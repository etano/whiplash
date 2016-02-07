// settings

try{ db.setProfilingLevel(2); } catch(err) {}

// users

try{ db.createUser({user:"www",pwd:"7cJgeAkHdw{oktPNYdgYE3nJ",roles:[{role:"readWrite",db:"wdb"}]}); } catch(err) {}
try{ db.createUser({user:"api",pwd:"haYrv{Ak9UJiaDsqVTe7rLJTc",roles:[{role:"readWrite",db:"wdb"}]}); } catch(err) {}
try{ db.createUser({user:"pwn",pwd:"cftXzdrjheHEARuJKT39x]3sV",roles:[{role:"dbOwner",db:"wdb"}]}); } catch(err) {}
try{ db.createUser({user:"scheduler",pwd:"c93lbcp0hc[5209sebf10{3ca",roles:[{role:"read",db:"wdb"}]}); } catch(err) {}

// unique indexes

try{ db.fs.files.createIndex({"metadata.md5": 1},{unique : true}); } catch(err) {}
try{ db.executables.createIndex({md5: 1},{unique: true}); } catch(err) {}
try{ db.properties.createIndex({md5: 1},{unique: true}); } catch(err) {}
try{ db.queries.createIndex({md5: 1},{unique: true}); } catch(err) {}
try{ db.collaborations.createIndex({name: 1},{unique: true}); } catch(err) {}
try{ db.users.createIndex({username: 1},{unique: true}); } catch(err) {}
try{ db.clients.createIndex({name: 1},{unique: true}); } catch(err) {}

// speed indexes

try{ db.properties.createIndex({owner: 1, input_model_id: 1, executable_id: 1}); } catch(err) {}
try{ db.work_batches.createIndex({timestamp : 1}); } catch(err) {}
try{ db.work_batches.createIndex({owner: 1, total_time : 1}); } catch(err) {}
try{ db.properties.createIndex({owner: 1, status: 1}); } catch(err) {}
try{ db.properties.createIndex({commit_tag: 1}); } catch(err) {}
