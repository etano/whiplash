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
f = open('rte.cfg','w')
f.write(ip+' '+url)
f.close()

print('installing rte...')
f = open('api.cfg','r')
[api_ip, api_url] = f.readline().rstrip().split(' ')
f.close()
print(ssh(host, pem, 'sudo yum update -y && sudo yum install -y docker && sudo service docker start && sudo usermod -a -G docker ec2-user'))
print(ssh(host, pem, 'docker run -d -v /var/run/docker.sock:/var/run/docker.sock -v /usr/bin/docker:/bin/docker -v $PWD:/input -p 1337:1337 whiplash/rte sh -c "./rte/create_token.py '+api_ip+' 1337 test test && ./rte/manager.py --local --host '+api_ip+' --port 1337 --verbose --docker"'))
