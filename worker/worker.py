#!/usr/bin/env python

import argparse
import docker
import json
import os
import whiplash

def main(args):
    # connect to whiplash
    db = whiplash.db(args.host, args.port, token=args.token)
    print db.status()

    # get unresolved properties
    unresolved_properties = db.properties.query(
        filter = {'status': 'unresolved'},
        fields = ['_id', 'timeout', 'input_model_id', 'executable_id']
    )

    # get input models
    input_models = {
        property.get('input_model_id'): db.models.query(
            filter = {'_id': property.get('input_model_id')}
        ) for property in unresolved_properties
    }

    # get executables
    executables = {
        property.get('executable_id'): db.executables.query(
            filter = {'_id': property.get('executable_id')}
        ) for property in unresolved_properties
    }

    # resolve properties
    for property in unresolved_properties:
        # mark property as running

        # get input model
        input_model = input_models.get(property.get('input_model_id'))[0]

        # get executable
        executable = executables.get(property.get('executable_id'))[0]

        # write model to file
        directory = '/tmp/whiplash'
        filename = '%s.json' % property.get('_id')
        path = os.path.join(directory, filename)
        if not os.path.exists(directory):
           os.makedirs(directory)
        with open(path, 'w') as f:
            input_model['params'] = property.get('params')
            f.write(json.dumps(input_model).replace(" ",""))

        # run executable on input model and property
        client = docker.from_env()
        container = client.containers.run(
            command = '%s' % path,
            image = executable.get('path'),
            remove = True,
            volumes = {directory: {'bind': directory, 'mode': 'rw'}}
        )
        print container.logs()
        # [{u'out_format': u'json', u'updated': 1517526476267, u'description': u'a test executable', u'algorithm': u'test', u'created': 1517526476261, u'commit_tag': u'5a739dcc0ff692002b795d2e', u'has_content': 0, u'in_format': u'json', u'version': u'test', u'params': {u'required': [u'sleep_time'], u'optional': []}, u'build': u'test', u'owner': u'a15b50941a54deeb', u'path': u'whiplash/sleeper:latest', u'_id': u'eede7636ada336ad', u'name': u'test_app'}]


if __name__ == '__main__':

    parser = argparse.ArgumentParser()
    parser.add_argument('--host', dest='host', required=True, type=str)
    parser.add_argument('--port', dest='port', required=True, type=int)
    parser.add_argument('--user', dest='user', required=True, type=str)
    parser.add_argument('--token', dest='token', required=True, type=str)
    parser.add_argument('--n_workers', dest='n_workers', required=False, type=int, default=1)
    args = parser.parse_args()

    main(args)
