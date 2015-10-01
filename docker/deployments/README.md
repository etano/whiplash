List of the Whiplash DB deployment schemes:


Remote.all: a fully remote deployment
---------------------------------------------------

    - No installation required: using whiplash.ethz.ch database
      for data storage and processing (provided having an account)

Local.all: a fully local deployment of the database
---------------------------------------------------

Installation includes the following containers:

    - the local Mongo database container
    - the local web-server container with the web-interface
    - the local run-time container with the whiplash scheduler

Local.scheduler: a partial local deployment (scheduler is local)
---------------------------------------------------

    - the database and web-interface are remote (i.e. whiplash.ethz.ch)
    - the local run-time container with the whiplash scheduler

Manual.scheduler: an offline deployment (no scheduler being used at all)
---------------------------------------------------

    - binaries for manual execution
    - a remote database should be populated manually

