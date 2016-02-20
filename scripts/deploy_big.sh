#!/bin/bash

#params

database_name="wdb"

data_dir="/mnt/lnec/whiplash/data"
#data_dirdata_dir="data"

log_dir="/mnt/lnec/whiplash/logs/mongo"
#log_dir="log"

key_file="/mnt/lnec/whiplash/mongodb.keyfile"

sharded_collections=("properties" "executables")

user_admin_username="UserAdmin"
user_admin_password="pass0"

root_admin_username="RootAdmin"
root_admin_password="pass1"

wdb_owner_username="pwn"
wdb_owner_password="cftXzdrjheHEARuJKT39x]3sV"

server_name="rs_conf"

server_hosts=(127.0.0.1 127.0.0.1 127.0.0.1)
server_ports=(27014 27015 27016)
server_log_dir=${log_dir}/servers
server_data_dir=${data_dir}/servers

router_hosts=(127.0.0.1)
router_ports=(27017)
router_log_dir=${log_dir}/routers

num_replicas=3
#shard_names=("rs0" "rs1" "rs2")
shard_names=("rs0" "rs1")
#assume flattened arrays of hosts and ports
#replica_hosts=(127.0.0.1 127.0.0.1 127.0.0.1 127.0.0.1 127.0.0.1 127.0.0.1 127.0.0.1 127.0.0.1 127.0.0.1)
replica_hosts=(127.0.0.1 127.0.0.1 127.0.0.1 127.0.0.1 127.0.0.1 127.0.0.1)
#replica_ports=(27018 27019 27020 27021 27022 27023 27024 27025 27026)
replica_ports=(27018 27019 27020 27021 27022 27023)
shard_log_dir=${log_dir}/shards
shard_data_dir=${data_dir}/shards

#should be some of the replicas
#shard_hosts=(127.0.0.1 127.0.0.1 127.0.0.1)
shard_hosts=(127.0.0.1 127.0.0.1)
#shard_ports=(27018 27021 27024)
shard_ports=(27018 27021)

############


#kill database

echo "Killing database"

killall mongod
killall mongos
sleep 3

#prepare

echo "Preparing"

#rm -rf ${data_dir} ${log_dir} #WARNING: debug

mkdir -p ${data_dir}
mkdir -p ${log_dir}

openssl rand -base64 741 > ${key_file}
chmod 600 ${key_file}

#deploy servers

echo "Deploying servers"

mkdir -p ${server_log_dir}
mkdir -p ${server_data_dir}

#set access control

server_data_dir_n=${server_data_dir}/db_0
mkdir -p ${server_data_dir_n}

echo "processManagement:
   fork: true
systemLog:
   destination: file
   path: \"${server_log_dir}/0.o\"
net:
   bindIp: ${server_hosts[0]}
   port: ${server_ports[0]}
storage:
   dbPath: \"${server_data_dir_n}\"
   journal:
      enabled: true" > mongo.config

mongod --config mongo.config

sleep 10

echo "db.createUser({user: \"${user_admin_username}\",pwd: \"${user_admin_password}\",roles: [ { role: \"userAdminAnyDatabase\", db: \"admin\"}]});" > config.js
echo "db.createUser({user: \"${root_admin_username}\",pwd: \"${root_admin_password}\",roles: [ { role: \"root\", db: \"admin\"}]});" >> config.js
mongo ${server_hosts[0]}:${server_ports[0]}/admin config.js
sleep 1

kill $(cat ${server_data_dir_n}/mongod.lock)

sleep 1

#deploy

for (( i=0; i<${#server_hosts[@]}; i++ ))
do
    server_data_dir_n=${server_data_dir}/db_${i}
    mkdir -p ${server_data_dir_n}

    echo "processManagement:
   fork: true
systemLog:
   destination: file
   path: \"${server_log_dir}/${i}.o\"
sharding:
   clusterRole: configsvr
replication:
   replSetName: ${server_name}
net:
   bindIp: ${server_hosts[${i}]}
   port: ${server_ports[${i}]}
security:
   authorization: enabled
   clusterAuthMode: keyFile
   keyFile: \"${key_file}\"
storage:
   dbPath: \"${server_data_dir_n}\"
   journal:
      enabled: true" > mongo.config

    numactl --interleave=all mongod --config mongo.config
    sleep 10
done

#initiate replica set

echo "Initiating replica set"

members=""
for (( i=0; i<${#server_hosts[@]}; i++ ))
do
    members=${members}"{_id:${i},\"host\":\"${server_hosts[${i}]}:${server_ports[${i}]}\"},"
done
members=${members%?}
echo "db.auth(\"${root_admin_username}\", \"${root_admin_password}\");" > config.js
echo "rs.initiate({_id:\"${server_name}\",configsvr: true,members:[${members}]})" >> config.js
mongo ${server_hosts[0]}:${server_ports[0]}/admin config.js
sleep 1

#deploy routers

echo "Deploying routers"

mkdir -p ${router_log_dir}

sharding="${server_name}/"
for (( i=0; i<${#server_hosts[@]}; i++ ))
do
    sharding=${sharding}${server_hosts[${i}]}:${server_ports[${i}]},
done
sharding=${sharding%?}

for (( i=0; i<${#router_hosts[@]}; i++ ))
do

echo "processManagement:
   fork: true
systemLog:
   destination: file
   path: \"${router_log_dir}/${i}.o\"
net:
   bindIp: ${router_hosts[${i}]}
   port: ${router_ports[${i}]}
security:
   clusterAuthMode: keyFile
   keyFile: \"${key_file}\"
sharding:
   configDB: ${sharding}" > mongo.config

numactl --interleave=all mongos --config mongo.config
sleep 10

done

#deploy shards

echo "Deploying shards"

mkdir -p ${shard_log_dir}
mkdir -p ${shard_data_dir}

for (( i=0; i<${#shard_names[@]}; i++ ))
do
    shard_data_dir_n=${shard_data_dir}/${shard_names[${i}]}
    mkdir -p ${shard_data_dir_n}

    shard_log_dir_n=${shard_log_dir}/${shard_names[${i}]}
    mkdir -p ${shard_log_dir_n}    

    #set access control

    replica_data_dir_n=${shard_data_dir_n}/db_0
    mkdir -p ${replica_data_dir_n}

    ind0=$(echo "${i}*${num_replicas}" | bc)

    echo "processManagement:
   fork: true
systemLog:
   destination: file
   path: \"${shard_log_dir_n}/0.o\"
net:
   bindIp: ${replica_hosts[${ind0}]}
   port: ${replica_ports[${ind0}]}
storage:
   dbPath: \"${replica_data_dir_n}\"
   journal:
      enabled: true" > mongo.config

    mongod --config mongo.config

    sleep 10

    echo "db.createUser({user: \"${user_admin_username}\",pwd: \"${user_admin_password}\",roles: [ { role: \"userAdminAnyDatabase\", db: \"admin\"}]});" > config.js
    echo "db.createUser({user: \"${root_admin_username}\",pwd: \"${root_admin_password}\",roles: [ { role: \"root\", db: \"admin\"}]});" >> config.js
    mongo ${replica_hosts[${ind0}]}:${replica_ports[${ind0}]}/admin config.js
    sleep 1
 
    kill $(cat ${replica_data_dir_n}/mongod.lock)

    sleep 1

    #deploy

    for (( j=0; j<${num_replicas}; j++ ))
    do
        replica_data_dir_n=${shard_data_dir_n}/db_${j}
        mkdir -p ${replica_data_dir_n}

        ind=$(echo "${i}*${num_replicas}+${j}" | bc)

        echo "processManagement:
    fork: true
systemLog:
    destination: file
    path: \"${shard_log_dir_n}/${j}.o\"
net:
    bindIp: ${replica_hosts[${ind}]}
    port: ${replica_ports[${ind}]}
storage:
    dbPath: \"${replica_data_dir_n}\"
    journal:
        enabled: true
security:
    authorization: enabled
    clusterAuthMode: keyFile
    keyFile: \"${key_file}\"
replication:
    replSetName: \"${shard_names[${i}]}\"" > mongo.config

       numactl --interleave=all mongod --config mongo.config
       sleep 10
    done

    members=""
    for (( j=0; j<${num_replicas}; j++ ))
    do
        ind=$(echo "${i}*${num_replicas}+${j}" | bc)
        members=${members}"{_id:${j},\"host\":\"${replica_hosts[${ind}]}:${replica_ports[${ind}]}\"},"
    done
    members=${members%?}
    echo "db.auth(\"${root_admin_username}\", \"${root_admin_password}\");" > config.js
    echo "rs.initiate({_id:\"${shard_names[${i}]}\",members:[${members}]})" >> config.js
    mongo ${replica_hosts[${ind0}]}:${replica_ports[${ind0}]}/admin config.js
    sleep 1
done

sleep 1

#add shards

echo "Adding shards"

for (( i=0; i<${#shard_hosts[@]}; i++ ))
do
    echo "db.auth(\"${root_admin_username}\", \"${root_admin_password}\");" > config.js
    echo "sh.addShard(\"${shard_names[${i}]}/${shard_hosts[${i}]}:${shard_ports[${i}]}\")" >> config.js
    mongo ${router_hosts[0]}:${router_ports[0]}/admin config.js
    sleep 10
done

#enable sharding

echo "Enabling sharding"

echo "db.auth(\"${root_admin_username}\", \"${root_admin_password}\");" > config.js
echo "sh.enableSharding(\"${database_name}\")" >> config.js
mongo ${router_hosts[0]}:${router_ports[0]}/admin config.js
sleep 10

#shard collections

echo "Sharding collections"

for (( i=0; i<${#sharded_collections[@]}; i++ ))
do
    collection=${sharded_collections[${i}]}
    echo "db.auth(\"${root_admin_username}\", \"${root_admin_password}\");" > config.js
    echo "db.getSiblingDB(\"${database_name}\").${collection}.createIndex({_id:\"hashed\"})" >> config.js
    echo "sh.shardCollection(\"${database_name}.${collection}\",{_id:\"hashed\"})" >> config.js
    mongo ${router_hosts[0]}:${router_ports[0]}/admin config.js
    sleep 10
done

echo "db.auth(\"${root_admin_username}\", \"${root_admin_password}\");" > config.js
echo "sh.shardCollection(\"${database_name}.fs.chunks\",{files_id: 1})" >> config.js
mongo ${router_hosts[0]}:${router_ports[0]}/admin config.js
sleep 10

#add users

echo "Adding users"

echo "db.auth(\"${user_admin_username}\", \"${user_admin_password}\");" > config.js
echo "db.getSiblingDB(\"${database_name}\").createUser({user:\"www\",pwd:\"7cJgeAkHdw{oktPNYdgYE3nJ\",roles:[{role:\"readWrite\",db:\"wdb\"}]});" >> config.js
echo "db.getSiblingDB(\"${database_name}\").createUser({user:\"api\",pwd:\"haYrv{Ak9UJiaDsqVTe7rLJTc\",roles:[{role:\"readWrite\",db:\"wdb\"}]});" >> config.js
echo "db.getSiblingDB(\"${database_name}\").createUser({user:\"${wdb_owner_username}\",pwd:\"${wdb_owner_password}\",roles:[{role:\"dbOwner\",db:\"wdb\"}]});" >> config.js
echo "db.getSiblingDB(\"${database_name}\").createUser({user:\"scheduler\",pwd:\"c93lbcp0hc[5209sebf10{3ca\",roles:[{role:\"read\",db:\"wdb\"}]});" >> config.js
mongo ${router_hosts[0]}:${router_ports[0]}/admin config.js

sleep 10

#add indexes

echo "Adding indexes"

echo "db.auth(\"${wdb_owner_username}\", \"${wdb_owner_password}\");" > config.js
echo "db.work_batches.createIndex({timestamp : 1},{unique: false});" >> config.js
echo "db.work_batches.createIndex({owner : 1, total_time: 1},{unique: false});" >> config.js
echo "db.properties.createIndex({owner: 1, status: 1},{unique: false});" >> config.js
echo "db.properties.createIndex({owner: 1, input_model_id: 1, executable_id: 1},{unique: false});" >> config.js
mongo ${router_hosts[0]}:${router_ports[0]}/wdb config.js

sleep 10
