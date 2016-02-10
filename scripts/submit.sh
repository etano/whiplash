#!/bin/bash
#SBATCH --job-name="whiplash_week"
#SBATCH --partition=dphys_hugemem_wk
#SBATCH --ntasks=20
#SBATCH --ntasks-per-node=20
#SBATCH --exclusive
#SBATCH --time=168:00:00
#SBATCH --mail-type=ALL
#SBATCH --mail-user=ebrown@itp.phys.ethz.ch
#SBATCH --output=whiplash_week.out
#SBATCH --error=whiplash_week.err
#======START===============================
srun /users/ebrown/src/whiplash/sleeper.sh
#======END================================= 
