#!/bin/bash
#SBATCH --job-name="whip_week"
#SBATCH --partition=dphys_compute_wk
#SBATCH --ntasks=1
#SBATCH --ntasks-per-node=1
#SBATCH --exclusive
#SBATCH --time=168:00:00
#SBATCH --mail-type=ALL
#SBATCH --mail-user=$USER@itp.phys.ethz.ch
#SBATCH --output=whiplash_week.out
#SBATCH --error=whiplash_week.err
#======START===============================
srun /users/$USER/src/whiplash/deployment/cluster/monch/solo/start_and_sleep.sh
#======END================================= 
