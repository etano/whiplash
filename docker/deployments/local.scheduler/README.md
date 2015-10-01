Local.scheduler: a partial local deployment (scheduler is local)
---------------------------------------------------

                                            ------------
                                           |            |
         ----     -----                    |    ----    |
        | DB | ~ | www |  << .network. <<  |   | RT |   |
         ----     -----                    |    ----    |
                                           |            |
                                            --- node --- 



Deployment includes the local run-time container with the whiplash scheduler for the local computational processing - the results are then sent to the remote database server (e.g. whiplash.ethz.ch).
