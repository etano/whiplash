List of the Whiplash prepackaged deployments
--------------------------------------------

- Remote.all: a fully remote deployment

          ----     -----     ----
         | DB |   | www |   | RT |
          ----     -----     ----
       
              ... network ...
       
                     ^
                   Client

- Local.all: a fully local deployment of the database

     _______________________________
    |                                |
    |     ----     -----     ----    |
    |    | DB |   | www |   | RT |   |
    |     ----     -----     ----    |
    |                                |
     -- Client's Linux Workstation --


- Local.scheduler: a partial local deployment (scheduler is local)

                                                 ____________
          ----     -----                        |            | 
         | DB |   | www |  << .. network .. <<  |    ----    | 
          ----     -----                        |   | RT |   | 
                                                |    ----    | 
                                                |            | 
                                                 -- Client --  


- Manual.scheduler: an offline deployment (no scheduler being used at all)

               ----     ----- 
              | DB |   | www |
               ----     ----- 
       
              ... network ...
       
                     ^
     _______________________________
    |                                |
    |          in >> binary >> out   |
    |                                |
    |                                |
    |                                |
     -- Client's Linux Workstation --
