Whiplash prepackaged deployments
--------------------------------------------

- Remote.all: a fully remote deployment

          ----     -----     ----
         | DB | ~ | www | ~ | RT |
          ----     -----     ----
       
              ... network ...
       
                     ^
                workstation

- Local.all: a fully local deployment

         --------------------------------
        |                                |
        |     ----     -----     ----    |
        |    | DB | ~ | www | ~ | RT |   |
        |     ----     -----     ----    |
        |                                |
         ----- offline workstation ------


- Local.scheduler: a partial local deployment (local scheduler)

                                            ------------
                                           |            |
         ----     -----                    |    ----    |
        | DB | ~ | www |  << .network. <<  |   | RT |   |
         ----     -----                    |    ----    |
                                           |            |
                                            --- node --- 


- Manual.scheduler: an offline deployment (no scheduler being used)

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

