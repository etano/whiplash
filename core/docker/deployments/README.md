Whiplash prepackaged deployments
--------------------------------------------

- managed.all: a fully managed deployment

         ----     -----     ----
        | DB | ~ | www | ~ | RT |
         ----     -----     ----
       
             ... network ...
       
                    ^
               workstation

- unmanaged.all: a fully unmanaged deployment

         --------------------------------
        |                                |
        |     ----     -----     ----    |
        |    | DB | ~ | www | ~ | RT |   |
        |     ----     -----     ----    |
        |                                |
         ----- unmanaged environment ----


- unmanaged.scheduler: a partial unmanaged deployment (local scheduler)

                                            ------------
                                           |            |
         ----     -----                    |    ----    |
        | DB | ~ | www |  << .network. <<  |   | RT |   |
         ----     -----                    |    ----    |
                                           |            |
                                            --- node --- 


- manual.scheduler: an offline deployment (no scheduler being used)

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

