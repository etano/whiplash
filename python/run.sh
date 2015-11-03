#!/bin/bash

wdb_info=$1
job_number=$2
time_limit=$3
job_limit=$4
time_window=$5
num_cpus=$6

###

job_name="whiplash_job_${job_number}"
log_dir="log/${job_name}"
mkdir -p ${log_dir}

run_file="run.sbatch"

> $run_file
echo "#!/bin/bash -l" >> $run_file

echo "#SBATCH --job-name=${job_name}" >> $run_file
echo "#SBATCH --output=${log_dir}/out.o" >> $run_file
echo "#SBATCH --error=${log_dir}/out.e" >> $run_file
echo "#SBATCH --partition=dphys_compute" >> $run_file
echo "#SBATCH --time=${time_limit}:00:00" >> $run_file
echo "#SBATCH --nodes=1" >> $run_file
echo "#SBATCH --exclusive" >> $run_file
echo "#SBATCH --ntasks=1" >> $run_file
echo "srun python scheduler_local.py --wdb_info ${wdb_info} --time_limit ${time_limit} --job_limit ${job_limit} --time_window ${time_window} --num_cpus ${num_cpus}" >> $run_file

sbatch $run_file
