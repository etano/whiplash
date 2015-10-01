Local.all: a fully local deployment of the database
---------------------------------------------------

         --------------------------------
        |                                |
        |     ----     -----     ----    |
        |    | DB | ~ | www | ~ | RT |   |
        |     ----     -----     ----    |
        |                                |
         ----- offline workstation ------


Deployment includes the local Mongo database container,  the local web-server container with the web-interface and the local run-time container with the whiplash scheduler for computational processing.
