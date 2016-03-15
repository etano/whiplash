import boto3
from ssh import ssh

client = boto3.client('ec2')

print('requesting instances...')
response = client.run_instances(
    ImageId='ami-d22932be',
    MinCount=1,
    MaxCount=1,
    KeyName='benchmarks',
    SecurityGroups=['Database'],
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
f = open('db.cfg','w')
f.write(ip+' '+url)
f.close()

print('installing db...')
host = 'ec2-user@'+url
pem = 'benchmarks.pem'
ssh(host, pem, 'sudo yum update -y && sudo yum install -y docker && sudo service docker start && sudo usermod -a -G docker ec2-user')
ssh(host, pem, 'docker run -d -p 27017:27017 whiplash/odb --auth')
