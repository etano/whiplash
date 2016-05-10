#!/bin/bash
#SBATCH --job-name="whip_day"
#SBATCH --partition=dphys_compute
#SBATCH --ntasks=20
#SBATCH --ntasks-per-node=20
#SBATCH --exclusive
#SBATCH --time=24:00:00
#SBATCH --mail-type=ALL
#SBATCH --mail-user=ebrown@itp.phys.ethz.ch
#SBATCH --output=whiplash_week.out
#SBATCH --error=whiplash_week.err
#======START===============================
srun /users/ebrown/src/whiplash/scripts/start_and_sleep.sh
#======END================================= 
