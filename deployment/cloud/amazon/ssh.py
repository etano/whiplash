import subprocess as sp

def ssh(host, pem, command=""):
    return sp.check_output("ssh -oStrictHostKeyChecking=no -i %s %s '%s'" % (pem, host, command), shell=True)
