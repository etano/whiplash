Whiplash prepackaged deployments
--------------------------------------------

- ./remote.all: a fully remote deployment

          ----     -----     ----
         | DB | ~ | www | ~ | RT |
          ----     -----     ----
       
              ... network ...
       
                     ^
                workstation

- ./local.all: a fully local deployment

         --------------------------------
        |                                |
        |     ----     -----     ----    |
        |    | DB | ~ | www | ~ | RT |   |
        |     ----     -----     ----    |
        |                                |
         ----- offline workstation ------


- ./local.scheduler: a partial local deployment (local scheduler)

                                            ------------
                                           |            |
         ----     -----                    |    ----    |
        | DB | ~ | www |  << .network. <<  |   | RT |   |
         ----     -----                    |    ----    |
                                           |            |
                                            --- node --- 


- ./manual.scheduler: an offline deployment (no scheduler being used)

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

