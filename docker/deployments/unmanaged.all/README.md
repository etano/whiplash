Unmanaged.all: a fully unmanaged deployment of the database
---------------------------------------------------

         --------------------------------
        |                                |
        |     ----     -----     ----    |
        |    | DB | ~ | www | ~ | RT |   |
        |     ----     -----     ----    |
        |                                |
         ----- unmanaged environment ----


Deployment includes the local Mongo database container,  the local web-server container with the web-interface and the local run-time container with the whiplash scheduler for computational processing.
