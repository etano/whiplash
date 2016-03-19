Manual.scheduler: an offline deployment (no scheduler being used at all)
---------------------------------------------------

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


Deployment contains the binaries for manual execution.
Instead of the automatic execution (e.g. as in local deployment) here the user is responsible to
give the right input in json format. The solver will print then the output in json.
Which can be manually put into the database afterward.

Note: usage of this deployment is highly discouraged.

