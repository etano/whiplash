# Quick Start

1. Apply for an account on Monch at
[http://www.cscs.ch](http://www.cscs.ch/user_lab/becoming_a_user/new_user_of_existing_project/index.html)
and choose __Matthias Troyer, p501a__ in the __Select PI__ dropdown

1. Make a Whiplash account on
[http://whiplash.ethz.ch](http://whiplash.ethz.ch). Note your session
token

1. Add Whiplash's public key to ~/.ssh/authorized_keys on your account

           ssh-rsa AAAAB3NzaC1yc2EAAAABIwAAAQEAq2bjz1D8/BIxumZnKp42ERDwtpTKEVK1iXu6+JUrBR86SK24S2uyxxARJDDQFZ8k1JL3FVc7b2k4di2WP6y3N8AImgGxclyXuJEiR2orbC/ij0PeN1ReyO/NHsIQZVvVt31AnnRA8nyfcnabIUas9c2zPXp5jWddz2dEijINffcQv0rgPVcm0bLAf3gM1ZG3QVD+6/dDaa7984Ebtif/kThi8EzOjtiK7ZM2Bqmp2HQBNhOvqCDiItjk6wSbdk/o96w4hZZ6D4ueqn4hTXUQnkH5j3L7PBanMQhIv8kn8OLEbtyuDsWG/iTV07fet9hhsDgihyOilio5CKOySCrRnQ== whiplash@cscs.ch

1. Get the latest version of the Whiplash python module from the
scratch directory on Monch __/mnt/lnec/whiplash/rte/whiplash.py__

1. Make sure the executable you want to run exists somewhere on Monch

1. Connect to the Whiplash server using your session token

           import whiplash          
           wdb = whiplash.wdb("monchc300.cscs.ch","1337","your_session_token")

1. Commit executable

          executable = {"description":"unitary evolution for Ising models","algorithm":"UE","name":"unitary evolution","version":"1.0.0","build":"O3","path":"/path/to/your/executable"}
          executable_id = wdb.executables.commit(executable)['ids'][0]['_id']

1. Commit model

          hamiltonian = [[[1,2],1],[[2,3],1],[[3,4],-1],[[4,1],1]]
          model = {"content":{"edges": hamiltonian},"tags":{"number of spins":4,"name":"periodic Ising chain"}}
          model_id = wdb.models.commit(model)['ids'][0]['_id']

1. Commit properties

          properties = []
          for i in range(10000): 
              properties.append({"params":{"seed":i,"hx":-1,"Ttot":500,"nsteps":400},"input_model_id":model_id,"executable_id":executable_id,"timeout":600})
          wdb.properties.commit(properties)

1. Get results

         results = wdb.properties.query({"params.n_sweeps":1000,"params.n_slices":64})