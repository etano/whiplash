#!/bin/bash

#params

database_name="wdb"

data_dir="data"
log_dir="log"

sharded_collections=("properties" "executables")

server_hosts=(127.0.0.1 127.0.0.1 127.0.0.1)
server_ports=(27014 27015 27016)
server_log_dir=${log_dir}/servers
server_data_dir=${data_dir}/servers

router_hosts=(127.0.0.1)
router_ports=(27017)
router_log_dir=${log_dir}/routers

num_replicas=3
shard_names=("rs0" "rs1" "rs2")
#assume flattened arrays of hosts and ports
replica_hosts=(127.0.0.1 127.0.0.1 127.0.0.1 127.0.0.1 127.0.0.1 127.0.0.1 127.0.0.1 127.0.0.1 127.0.0.1)
replica_ports=(27018 27019 27020 27021 27022 27023 27024 27025 27026)
shard_log_dir=${log_dir}/shards
shard_data_dir=${data_dir}/shards

shard_hosts=(127.0.0.1 127.0.0.1 127.0.0.1)
shard_ports=(27018 27021 27024)

############


#kill database

echo "Killing database"

killall mongod
killall mongos
sleep 3

#prepare

echo "Preparing"

#rm -rf ${data_dir} ${log_dir}

mkdir -p ${data_dir}
mkdir -p ${log_dir}

#deploy servers

echo "Deploying servers"

mkdir -p ${server_log_dir}
mkdir -p ${server_data_dir}

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
   replSetName: configReplSet
net:
   bindIp: ${server_hosts[${i}]}
   port: ${server_ports[${i}]}
storage:
   dbPath: \"${server_data_dir_n}\"
   journal:
      enabled: true" > mongo.config

    mongod --config mongo.config
done

sleep 1

#initiate replica set

echo "Initiating replica set"

members=""
for (( i=0; i<${#server_hosts[@]}; i++ ))
do
    members=${members}"{_id:${i},\"host\":\"${server_hosts[${i}]}:${server_ports[${i}]}\"},"
done
members=${members%?}

echo "rs.initiate({_id:\"configReplSet\",configsvr: true,members:[${members}]})" > config.js

mongo ${server_hosts[0]}:${server_ports[0]} config.js

sleep 1

#deploy routers

echo "Deploying routers"

mkdir -p ${router_log_dir}

sharding="configReplSet/"
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
sharding:
   configDB: ${sharding}" > mongo.config

mongos --config mongo.config

done

sleep 1

#deploy replicas

echo "Deploying replicas"

mkdir -p ${shard_log_dir}
mkdir -p ${shard_data_dir}

for (( i=0; i<${#shard_names[@]}; i++ ))
do
    shard_data_dir_n=${shard_data_dir}/${shard_names[${i}]}
    mkdir -p ${shard_data_dir_n}

    shard_log_dir_n=${shard_log_dir}/${shard_names[${i}]}
    mkdir -p ${shard_log_dir_n}    

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
replication:
    replSetName: \"${shard_names[${i}]}\"" > mongo.config

        mongod --config mongo.config
    done

    members=""
    for (( j=0; j<${num_replicas}; j++ ))
    do
        ind=$(echo "${i}*${num_replicas}+${j}" | bc)
        members=${members}"{_id:${j},\"host\":\"${replica_hosts[${ind}]}:${replica_ports[${ind}]}\"},"
    done
    members=${members%?}

    echo "rs.initiate({_id:\"${shard_names[${i}]}\",members:[${members}]})" > config.js
    ind0=$(echo "${i}*${num_replicas}" | bc)
    mongo ${replica_hosts[${ind0}]}:${replica_ports[${ind0}]} config.js

done

sleep 1

#add shards

echo "Adding shards"

for (( i=0; i<${#shard_hosts[@]}; i++ ))
do
    echo "sh.addShard(\"${shard_names[${i}]}/${shard_hosts[${i}]}:${shard_ports[${i}]}\")" > config.js
    mongo ${router_hosts[0]}:${router_ports[0]} config.js
done

sleep 1

#enable sharding

echo "Enabling sharding"

echo "sh.enableSharding(\"${database_name}\")" > config.js
mongo ${router_hosts[0]}:${router_ports[0]} config.js

sleep 1

#shard collections

for (( i=0; i<${#sharded_collections[@]}; i++ ))
do
    collection=${sharded_collections[${i}]}
    echo "Sharding ${collection}"
    echo "db.${collection}.createIndex({_id:\"hashed\"})" > config.js
    echo "sh.shardCollection(\"wdb.${collection}\",{_id:\"hashed\"})" >> config.js
    mongo ${router_hosts[0]}:${router_ports[0]} config.js
done

sleep 1
