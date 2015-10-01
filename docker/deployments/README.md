List of the Whiplash prepackaged deployments
--------------------------------------------

- Remote.all: a fully remote deployment

          ----     -----     ----
         | DB | - | www | - | RT |
          ----     -----     ----
       
              ... network ...
       
                     ^
                 workstation

- Local.all: a fully local deployment of the database

      _______________________________
     |                                |
     |     ----     -----     ----    |
     |    | DB | - | www | - | RT |   |
     |     ----     -----     ----    |
     |                                |
      ----- offline workstation ------


- Local.scheduler: a partial local deployment (scheduler is local)

                                            ____________
                                           |            |
         ----     -----                    |    ----    |
        | DB | - | www |  << .network. <<  |   | RT |   |
         ----     -----                    |    ----    |
                                           |            |
                                            --- node --- 


- Manual.scheduler: an offline deployment (no scheduler being used at all)

              ----     ----- 
             | DB | - | www |
              ----     ----- 

              ... network ...
                     ^
             ... usb stick ...
                     ^
      _______________________________
     |                                |
     |  json.in >> binary >> json.out |
     |                                |
      ------ offline workstation -----
