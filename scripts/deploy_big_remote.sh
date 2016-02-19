#!/bin/bash

IFS='%'

#params

#config assumes a distributed file-system between the hosts

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

machines=("monchc300.cscs.ch" "monchc301.cscs.ch" "monchc302.cscs.ch" "monchc303.cscs.ch")
main_machine="monchc300.cscs.ch"

server_hosts=("monchc301.cscs.ch" "monchc302.cscs.ch" "monchc303.cscs.ch")
server_ports=(27017 27017 27017)
server_log_dir=${log_dir}/servers
server_data_dir=${data_dir}/servers

router_hosts=("monchc300.cscs.ch")
router_ports=(27017)
router_log_dir=${log_dir}/routers

num_replicas=3
shard_names=("rs0" "rs1" "rs2")
#assume flattened arrays of hosts and ports
replica_hosts=("monchc301.cscs.ch" "monchc302.cscs.ch" "monchc303.cscs.ch" "monchc302.cscs.ch" "monchc303.cscs.ch" "monchc301.cscs.ch" "monchc303.cscs.ch" "monchc301.cscs.ch" "monchc302.cscs.ch")
replica_ports=(27018 27018 27018 27019 27019 27019 27020 27020 27020)
shard_log_dir=${log_dir}/shards
shard_data_dir=${data_dir}/shards

#should be some of the replicas
shard_hosts=("monchc301.cscs.ch" "monchc302.cscs.ch" "monchc303.cscs.ch")
shard_ports=(27018 27019 27020)

mongo_dir="/users/whiplash/mongodb-linux-x86_64-3.2.1/bin"
mongo="${mongo_dir}/mongo"
mongod="${mongo_dir}/mongod"
mongos="${mongo_dir}/mongos"

############

#kill database

echo "Killing database"

for (( i=0; i<${#machines[@]}; i++ ))
do
    sh scripts/remote_command.sh ${machines[${i}]} "killall mongod; killall mongos"
done

sleep 3

#prepare

echo "Preparing"

sh scripts/remote_command.sh ${main_machine} "rm -rf ${data_dir} ${log_dir}" #WARNING: debug

sh scripts/remote_command.sh ${main_machine} "mkdir -p ${data_dir}; mkdir -p ${log_dir}; openssl rand -base64 741 > ${key_file}; chmod 600 ${key_file}"

#deploy servers

echo "Deploying servers"

sh scripts/remote_command.sh ${main_machine} "mkdir -p ${server_log_dir}; mkdir -p ${server_data_dir}"

#set access control

server_data_dir_n=${server_data_dir}/db_0

sh scripts/remote_command.sh ${server_hosts[0]} '
mkdir -p '"${server_data_dir_n}"';
echo "
processManagement:
 fork: true
systemLog:
 destination: file
 path: \"'"${server_log_dir}"'/0.o\"
net:
 bindIp: '"${server_hosts[0]}"'
 port: '"${server_ports[0]}"'
storage:
 dbPath: \"'"${server_data_dir_n}"'\"
 journal:
  enabled: true" > mongo.config;
'"${mongod}"' --config mongo.config;
sleep 10;
echo "db.createUser({user: \"'"${user_admin_username}"'\",pwd: \"'"${user_admin_password}"'\",roles: [ { role: \"userAdminAnyDatabase\", db: \"admin\"}]});" > config.js;
echo "db.createUser({user: \"'"${root_admin_username}"'\",pwd: \"'"${root_admin_password}"'\",roles: [ { role: \"root\", db: \"admin\"}]});" >> config.js;
'"${mongo}"' '"${server_hosts[0]}"':'"${server_ports[0]}"'/admin config.js;
sleep 1;
kill $(cat '"${server_data_dir_n}"'/mongod.lock);
sleep 1;
'

exit;

#deploy

for (( i=0; i<${#server_hosts[@]}; i++ ))
do
    sh scripts/remote_command.sh ${server_hosts[${i}]} "
    server_data_dir_n=${server_data_dir}/db_${i}\n
    mkdir -p ${server_data_dir_n}\n
\n
    echo \"processManagement:\n
\t fork: true
systemLog:\n
\t destination: file\n
\t path: \"${server_log_dir}/${i}.o\"\n
sharding:\n
\t clusterRole: configsvr\n
replication:\n
\t replSetName: ${server_name}\n
net:\n
\t bindIp: ${server_hosts[${i}]}\n
\t port: ${server_ports[${i}]}\n
security:\n
\t authorization: enabled\n
\t clusterAuthMode: keyFile\n
\t keyFile: \"${key_file}\"\n
storage:\n
\t dbPath: \"${server_data_dir_n}\"\n
\t journal:\n
\t \t enabled: true\" > mongo.config\n
\n
    numactl --interleave=all mongod --config mongo.config\n
    sleep 10\n
"
done

#initiate replica set

echo "Initiating replica set"

members=""
for (( i=0; i<${#server_hosts[@]}; i++ ))
do
    members=${members}"{_id:${i},\"host\":\"${server_hosts[${i}]}:${server_ports[${i}]}\"},"
done
members=${members%?}

sh scripts/remote_command.sh ${server_hosts[0]} "
echo \"db.auth(\"${root_admin_username}\", \"${root_admin_password}\");\" > config.js\n
echo \"rs.initiate({_id:\"${server_name}\",configsvr: true,members:[${members}]})\" >> config.js\n
mongo ${server_hosts[0]}:${server_ports[0]}/admin config.js\n
sleep 1\n
"

#deploy routers

echo "Deploying routers"

sharding="${server_name}/"
for (( i=0; i<${#server_hosts[@]}; i++ ))
do
    sharding=${sharding}${server_hosts[${i}]}:${server_ports[${i}]},
done
sharding=${sharding%?}

sh scripts/remote_command.sh ${main_host} "mkdir -p ${router_log_dir}"

for (( i=0; i<${#router_hosts[@]}; i++ ))
do
sh scripts/remote_command.sh ${router_hosts[${i}]} "
echo \"processManagement:\n
\tfork: true\n
systemLog:\n
\t destination: file\n
\t path: \"${router_log_dir}/${i}.o\"\n
net:\n
\t bindIp: ${router_hosts[${i}]}\n
\t port: ${router_ports[${i}]}\n
security:\n
\t clusterAuthMode: keyFile\n
\t keyFile: \"${key_file}\"\n
sharding:\n
\tconfigDB: ${sharding}\" > mongo.config\n
\n
numactl --interleave=all mongos --config mongo.config\n
sleep 10\n
"
done

#deploy shards

echo "Deploying shards"

sh scripts/remote_command.sh ${main_host} "mkdir -p ${shard_log_dir}; mkdir -p ${shard_data_dir}"

for (( i=0; i<${#shard_names[@]}; i++ ))
do
    ind0=$(echo "${i}*${num_replicas}" | bc)

    sh scripts/remote_command.sh ${replica_hosts[${ind0}]} "
    shard_data_dir_n=${shard_data_dir}/${shard_names[${i}]}\n
    mkdir -p ${shard_data_dir_n}\n
\n
    shard_log_dir_n=${shard_log_dir}/${shard_names[${i}]}\n
    mkdir -p ${shard_log_dir_n}\n
\n
    replica_data_dir_n=${shard_data_dir_n}/db_0\n
    mkdir -p ${replica_data_dir_n}\n
\n
    echo \"processManagement:\n
   \t fork: true\n
systemLog:\n
   \t destination: file\n
   \t path: \"${shard_log_dir_n}/0.o\"\n
net:\n
   \t bindIp: ${replica_hosts[${ind0}]}\n
   \t port: ${replica_ports[${ind0}]}\n
storage:\n
   \t dbPath: \"${replica_data_dir_n}\"\n
   \t journal:\n
      \t \t enabled: true\" > mongo.config\n
\n
    mongod --config mongo.config\n
\n
    sleep 10\n

    echo \"db.createUser({user: \"${user_admin_username}\",pwd: \"${user_admin_password}\",roles: [ { role: \"userAdminAnyDatabase\", db: \"admin\"}]});\" > config.js\n
    echo \"db.createUser({user: \"${root_admin_username}\",pwd: \"${root_admin_password}\",roles: [ { role: \"root\", db: \"admin\"}]});\" >> config.js\n
    mongo ${replica_hosts[${ind0}]}:${replica_ports[${ind0}]}/admin config.js\n
    sleep 1\n
 \n
    kill \$(cat ${replica_data_dir_n}/mongod.lock)\n
\n
    sleep 1\n
"

    #deploy

    for (( j=0; j<${num_replicas}; j++ ))
    do
        ind=$(echo "${i}*${num_replicas}+${j}" | bc)
        sh scripts/remote_command.sh ${replica_hosts[${ind}]} "
        replica_data_dir_n=${shard_data_dir_n}/db_${j}\n
        mkdir -p ${replica_data_dir_n}\n
\n
        echo \"processManagement:\n
    \t fork: true\n
systemLog:\n
    \t destination: file\n
    \t path: \"${shard_log_dir_n}/${j}.o\"\n
net:\n
    \t bindIp: ${replica_hosts[${ind}]}\n
    \t port: ${replica_ports[${ind}]}\n
storage:\n
    \t dbPath: \"${replica_data_dir_n}\"\n
    \t journal:\n
        \t \t enabled: true\n
security:\n
    \t authorization: enabled\n
    \t clusterAuthMode: keyFile\n
    \t keyFile: \"${key_file}\"\n
replication:\n
    \t replSetName: \"${shard_names[${i}]}\"\" > mongo.config\n
\n
       numactl --interleave=all mongod --config mongo.config\n
       sleep 10\n
"
    done

    members=""
    for (( j=0; j<${num_replicas}; j++ ))
    do
        ind=$(echo "${i}*${num_replicas}+${j}" | bc)
        members=${members}"{_id:${j},\"host\":\"${replica_hosts[${ind}]}:${replica_ports[${ind}]}\"},"
    done
    members=${members%?}
    sh scripts/remote_command.sh ${replica_hosts[${ind0}]} "
    echo \"db.auth(\"${root_admin_username}\", \"${root_admin_password}\");\" > config.js\n
    echo \"rs.initiate({_id:\"${shard_names[${i}]}\",members:[${members}]})\" >> config.js\n
    mongo ${replica_hosts[${ind0}]}:${replica_ports[${ind0}]}/admin config.js\n
    sleep 1\n
"
done

sleep 1

#add shards

echo "Adding shards"

for (( i=0; i<${#shard_hosts[@]}; i++ ))
do
    sh scripts/remote_command.sh ${router_hosts[0]} "
    echo \"db.auth(\"${root_admin_username}\", \"${root_admin_password}\");\" > config.js\n
    echo \"sh.addShard(\"${shard_names[${i}]}/${shard_hosts[${i}]}:${shard_ports[${i}]}\")\" >> config.js\n
    mongo ${router_hosts[0]}:${router_ports[0]}/admin config.js\n
    sleep 10\n
"
done

#enable sharding

echo "Enabling sharding"

sh scripts/remote_command.sh ${router_hosts[0]} "
echo \"db.auth(\"${root_admin_username}\", \"${root_admin_password}\");\" > config.js\n
echo \"sh.enableSharding(\"${database_name}\")\" >> config.js\n
mongo ${router_hosts[0]}:${router_ports[0]}/admin config.js\n
sleep 10\n
"

#shard collections

echo "Sharding collections"

for (( i=0; i<${#sharded_collections[@]}; i++ ))
do
    collection=${sharded_collections[${i}]}
    sh scripts/remote_command.sh ${router_hosts[0]} "
    echo \"db.auth(\"${root_admin_username}\", \"${root_admin_password}\");\" > config.js\n
    echo \"db.getSiblingDB(\"${database_name}\").${collection}.createIndex({_id:\"hashed\"})\" >> config.js\n
    echo \"sh.shardCollection(\"${database_name}.${collection}\",{_id:\"hashed\"})\" >> config.js\n
    mongo ${router_hosts[0]}:${router_ports[0]}/admin config.js\n
    sleep 10\n
"
done

sh scripts/remote_command.sh ${router_hosts[0]} "
echo \"db.auth(\"${root_admin_username}\", \"${root_admin_password}\");\" > config.js\n
echo \"sh.shardCollection(\"${database_name}.fs.chunks\",{files_id: 1})\" >> config.js\n
mongo ${router_hosts[0]}:${router_ports[0]}/admin config.js\n
sleep 10\n
"

#add users

echo "Adding users"

sh scripts/remote_command.sh ${router_hosts[0]} "
echo \"db.auth(\"${user_admin_username}\", \"${user_admin_password}\");\" > config.js\n
echo \"db.getSiblingDB(\"${database_name}\").createUser({user:\"www\",pwd:\"7cJgeAkHdw{oktPNYdgYE3nJ\",roles:[{role:\"readWrite\",db:\"wdb\"}]});\" >> config.js\n
echo \"db.getSiblingDB(\"${database_name}\").createUser({user:\"api\",pwd:\"haYrv{Ak9UJiaDsqVTe7rLJTc\",roles:[{role:\"readWrite\",db:\"wdb\"}]});\" >> config.js\n
echo \"db.getSiblingDB(\"${database_name}\").createUser({user:\"${wdb_owner_username}\",pwd:\"${wdb_owner_password}\",roles:[{role:\"dbOwner\",db:\"wdb\"}]});\" >> config.js\n
echo \"db.getSiblingDB(\"${database_name}\").createUser({user:\"scheduler\",pwd:\"c93lbcp0hc[5209sebf10{3ca\",roles:[{role:\"read\",db:\"wdb\"}]});\" >> config.js\n
mongo ${router_hosts[0]}:${router_ports[0]}/admin config.js\n
\n
sleep 10
"

#add indexes

echo "Adding indexes"

sh scripts/remote_command.sh ${router_hosts[0]} "
echo \"db.auth(\"${wdb_owner_username}\", \"${wdb_owner_password}\");\" > config.js\n
echo \"db.fs.files.createIndex({\"metadata.md5\" : 1, \"metadata.property_id\" : 1, \"metadata.owner\" : 1},{unique : true});\" >> config.js\n
echo \"db.executables.createIndex({name: 1, path: 1, md5: 1, owner: 1},{unique: true});\" >> config.js\n
echo \"db.properties.createIndex({md5: 1},{unique: true});\" >> config.js\n
echo \"db.queries.createIndex({owner: 1, md5: 1},{unique: true});\" >> config.js\n
echo \"db.collaborations.createIndex({name: 1},{unique: true});\" >> config.js\n
echo \"db.users.createIndex({username: 1},{unique: true});\" >> config.js\n
echo \"db.clients.createIndex({name: 1},{unique: true});\" >> config.js\n
echo \"db.work_batches.createIndex({timestamp : 1},{unique: false});\" >> config.js\n
echo \"db.properties.createIndex({owner: 1, status: 1},{unique: false});\" >> config.js\n
echo \"db.properties.createIndex({commit_tag: 1},{unique: false});\" >> config.js\n
echo \"db.properties.createIndex({status: 1, timeout: 1},{unique: false});\" >> config.js\n
echo \"db.properties.createIndex({input_model_id: 1, executable_id: 1},{unique: false});\" >> config.js\n
mongo ${router_hosts[0]}:${router_ports[0]}/wdb config.js\n
\n
sleep 10
"
