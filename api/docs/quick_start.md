# Quick Start

1. Go to [http://whiplash.ethz.ch](http://whiplash.ethz.ch) and apply for
an account. Make note of your session token.

2. Add Whiplash's public key to ~/.ssh/authorized_keys on your account

           ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC0+Reqt4F8IO3nb0nx84aaZuyfrR1htA+J3SuT5az9he6TcAVY1/kzHeDWV7EaKDquM0wfPES173ozKAUVG5sgNdJTpI10+9+cIgN5/GhbYbA/XEveod0yfjvcdIXONsvOEX4FIxvfQxp3gTG9smX6Xb1Uu6KVYiTiwj9jnrHVxx00zpNAGNDVnaTI4DXTZtuzl/Pymzjl06b7s07d07UCnPrDXXa3jqlwHamms/jPDFq1OIsLkq5LcOGl0VK5fsVnBe5UKktjEVv6ojF18jrOef812v0/wHjTkOBuiYYRTMv/USoerHlZdBsPCjDf0TrHPbjiRSrpe85O0uMxM15h root@whiplash-dev

2. Get the Whiplash python module

3. Make sure the executable you want to run exists somewhere on the
cluster

4. Connect to the Whiplash server using your session token

           import whiplash          
           wdb = whiplash.wdb("whiplash.ethz.ch","443","you_session_token")

5. Define your executable

          executable = {"description":"unitary evolution for Ising models","algorithm":"UE","name":"unitary evolution","version":"1.0.0","build":"O3","path":"/users/whiplash/whiplash/whiplash/python/ue_solver"}

6. Define your model

          hamiltonian = [[[1,2],1],[[2,3],1],[[3,4],-1],[[4,1],1]]
          model = {"content":{"edges": hamiltonian},"tags":{"number of spins":4,"name":"periodic Ising chain"}}

7. Define what you want computed

         props = []
         for seed in range(N):
             props.append({"params":{"n_sweeps":1000,"n_slices":64,"seed":seed}, "timeout":3600})

8. Submit jobs

          wdb.properties.submit(model,executable,props)

9. Have a glass of whisky

10. Get results

         data = wdb.properties.query({"params.n_sweeps":1000,"params.n_slices":64}})

11. Plot data

         import matplotlib.pyplot as plt
         plt.plot(range(N),data.energies)
         plt.show()

