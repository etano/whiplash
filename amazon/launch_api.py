import boto3
from ssh import ssh

client = boto3.client('ec2')

print('requesting instances...')
response = client.run_instances(
    ImageId='ami-d22932be',
    MinCount=1,
    MaxCount=1,
    KeyName='benchmarks',
    SecurityGroups=['API'],
    InstanceType='t2.micro',
    Monitoring={'Enabled': True}
)
ids = [x['InstanceId'] for x in response['Instances']]
waiter = client.get_waiter('instance_status_ok')
waiter.wait(
    DryRun=False,
    InstanceIds=ids
)
print('done.')

print('fetching ips...')
response = client.describe_instances(
    DryRun=False,
    InstanceIds=ids
)
ip = response['Reservations'][0]['Instances'][0]['PublicIpAddress']
url = response['Reservations'][0]['Instances'][0]['PublicDnsName']
host = 'ec2-user@'+url
pem = 'benchmarks.pem'
f = open('api.cfg','w')
f.write(ip+' '+url)
f.close()

print('installing api...')
f = open('db.cfg','r')
[db_ip, db_url] = f.readline().rstrip().split(' ')
f.close()
print(ssh(host, pem, 'sudo yum update -y && sudo yum install -y docker && sudo service docker start && sudo usermod -a -G docker ec2-user'))
print(ssh(host, pem, 'docker run -d -e "MONGO_PORT_27017_TCP_ADDR='+db_ip+'" -e "MONGO_PORT_27017_TCP_PORT=27017" -e "MONGO_API_USERNAME=api" -e "MONGO_API_PASSWORD=haYrv{Ak9UJiaDsqVTe7rLJTc" -p 1337:1337 whiplash/api sh -c "node --use_strict bin/createUser.js test test test@test.com; node --use_strict bin/createClient.js test-python test-python test; node --use_strict bin/createClient.js test-scheduler test-scheduler test; node --use_strict bin/createUser.js scheduler c93lbcp0hc[5209sebf10{3ca scheduler@whiplash.ethz.ch; node --use_strict bin/createClient.js scheduler scheduler-python c93lbcp0hc[5209sebf10{3ca; node --use_strict bin/api"'))
