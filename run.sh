#!/bin/bash

wdb_info=$1
job_number=$2
cpu_time=$3

###

job_name="whiplash_job_${job_number}"
log_dir="log/${job_name}"
mkdir -p ${log_dir}

run_file="run.sbatch"

> $run_file
echo "#!/bin/bash -l" >> $run_file

echo "#SBATCH --job-name=${job_name}" >> $run_file
echo "#SBATCH --output=${dir_log}/out.o" >> $run_file
echo "#SBATCH --error=${dir_log}/out.e" >> $run_file
echo "#SBATCH --partition=dphys_compute" >> $run_file
echo "#SBATCH --time=${cpu_time}:00:00" >> $run_file
echo "#SBATCH --nodes=1" >> $run_file
echo "#SBATCH --exclusive" >> $run_file
echo "#SBATCH --ntasks=1" >> $run_file
echo "srun python scheduler.py --wdb_info ${wdb_info}" >> $run_file

sbatch $run_file
