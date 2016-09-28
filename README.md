# Whiplash Overview

## Description

Project whiplash was created for the purpose of automatic running and data logging for the massive amount of individual simulations.
The simulations can be run either as stand-alone applications, in which case the user is responsible for committing the resulting data into the database manually.
Or as a part of a querying process where a user queries the system for properties that are inferred from the target model using the specific solver.

The system is structured to work with the following entitites (supplied as JSON):

- Model: a description of the input data (can be bulk-data), i.e. Hamiltonian description.
- Executable: a description of the application used for a particular simulation.
- Property: a set of input and output parameters that an executable requires to work with the specified model.

A typical workflow then looks like the following:

1. Commit the model description
2. Commit the solver description
3. Submit the property description
4. Query the property to get the results

The Whiplash runtime component is responsible for the actual process of running the solver, reading the input and writing back the output into database.

## Installation

The following two deployment models are supported: local and cluster.
Both of them require several components to be up and running: the database to log the simulations data, API gateway and a scheduler to run the simulations.

### Local installation

This type of installation utilises docker-based containers and requires docker-compose and is meant to run on a single node or a personal computer.

0. Install Docker (http://www.docker.com/)
1. Install Docker-compose

    curl -L https://github.com/docker/compose/releases/download/1.8.0/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose

2. Building and running the Whiplash from the project folder
    docker-compose -f deployment/local/docker-compose.yml up -d

3. Testing
    export PYTHONPATH=$PWD/rte:$PYTHONPATH
    ./tests/pre-tests.py localhost 1337
    sleep 60
    ./tests/post-tests.py localhost 1337

### Cluster installation

This type of installation requires a scheduler that is adapted to the batch system used on a cluster (Slurm is shipped as a default).

For the Monch cluster at ETH Zurich we followed the steps below:

1. Install NodeJS
2. Install MongoDB
3. Submit a week long job to use a central hub

    sbatch deployment/cluster/monch/submit-week.sh

This last step will require specialization for other cluster environments.

## Usage

The typical workflow stages are performed using Python interface as following:

- Create connection to the database

    db = whiplash.db("localhost", 1337, <username>, <password>)

- Commit the model (see examples/local/commit_models.py)

    db.models.commit({ model description })

- Commit the solver description (see examples/local/commit_executable.py)

    db.executables.commit({ ... })

- Submit the query to be resolved (see examples/local/submit.py)

    db.submit({ filters }, { settings })

- Query for the property to see the results (see examples/local/query.py)

    db.query({ search params }, { dict of lists of fields to return })

The same workflow can be performed manually if executable has to be run offline.
See an example (at ./examples/manual/commit_result.py) using input and output json files as arguments to commit the result.

Check the api/docs section for the detailed list of available parameters for different entities and commands.

## Users

By default two user/password combinations are created with the database, "test/test" and "admin/password". The admin user has access to all data in the database, while the test user can only access or modify the documents they create. If a particular document is flagged as {"owner":"internal"}, it may be read by everyone, but again only modified by the admin.

To create a new user do:

    docker exec -it local_api_1 node --use_strict bin/create_user USERNAME PASSWORD EMAIL

## Troubleshooting

- In order to check what happens, it might be useful to inspect the contents of the database.
  This can be done by connecting to the mongo database container, i.e.:

    docker exec -it local_odb_1 mongo localhost:27017/wdb

- If something isn't working anymore one can try restarting the containers

    docker-compose -f deployment/local/docker-compose.yml restart

  or stopping, removing them and building them again

    docker-compose -f deployment/local/docker-compose.yml stop
    docker-compose -f deployment/local/docker-compose.yml rm
    docker-compose -f deployment/local/docker-compose.yml build
    docker-compose -f deployment/local/docker-compose.yml up -d

- If you need to remove something from Whiplash, see the reset script at

    ./tests/reset.py
