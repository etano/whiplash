# Deployment

We offer several types of possible deployments which can rely minimally or maximally on our remote servers. To make each as simple as possible, we rely heavily on the docker container system. Below we sketch all possible deployment solutions with _DB_ being the database, _RT_ being the runtime environment (scheduler), and _www_ is a web server.

## remote.all : fully remote deployment

No installation required for this deployment. The remote (e.g. whiplash.ethz.ch) maintains the actual database and the run-time environment.

          ----     -----     ----
         | DB | ~ | www | ~ | RT |
          ----     -----     ----
       
              ... network ...
       
                     ^
                workstation

The end user need only install the [WhiplashDB](http://whiplash.ethz.ch) python module to be able to commit models, properties, and executables to our remotely hosted framework.

## local.all : fully local deployment

This deployment includes the local Mongo database container, the local web-server container with the web-interface, and the local run-time container with the whiplash scheduler for computational processing.

         --------------------------------
        |                                |
        |     ----     -----     ----    |
        |    | DB | ~ | www | ~ | RT |   |
        |     ----     -----     ----    |
        |                                |
         ----- offline workstation ------

With the __local.all__ deployment, the user has access to the full [WhiplashDB](http://whiplash.ethz.ch) solution, even though it is disconnected from the rest of the world.

## local.scheduler : partial local deployment

This deployment includes the local run-time container with the whiplash scheduler for the local computational processing - the results are then sent to the remote database server (e.g. whiplash.ethz.ch).

                                            ------------
                                           |            |
         ----     -----                    |    ----    |
        | DB | ~ | www |  << .network. <<  |   | RT |   |
         ----     -----                    |    ----    |
                                           |            |
                                            --- node --- 

## manual.scheduler : offline deployment

This deployment contains the binaries for manual execution. Instead of the automatic execution (e.g. as in __local.all__) here the user is responsible to give the right input in json format. The output of the solver needs to then be converted back to json format and can then be manually put into the database afterward with the [WhiplashDB](http://whiplash.ethz.ch) Python module.

                ----     ----- 
               | DB | ~ | www |
                ----     ----- 
        
                ... network ...
                       ^
               ... usb stick ...
                       ^
         --------------------------------
        |                                |
        |  json.in >> binary >> json.out |
        |                                |
         ------ offline workstation -----

Note that usage of this deployment should be reserved only for those behind an extremely strict firewall since there will be considerably more overhead when serializing to and from ASCII json.
