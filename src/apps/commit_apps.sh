#!/bin/bash

# Discrete time SQA
$1 ${WDB_HOME}/bin/commit_executable.driver -class ising -owner 'ethz' -description 'A discrete time simulated quantum annealing solver' -algorithm 'SQA' -name 'dtsqa' -version '1.0.0' -build 'O3' -path ${WDB_HOME}/src/apps/DT-SQA/dtsqa -dbhost localhost:27017

# XX Solver
$1 ${WDB_HOME}/bin/commit_executable.driver -class ising -owner 'ethz' -description 'A looper algorithm implementation with the ability to treat XX couplings' -algorithm 'looper' -name 'XXcode' -version '1.0.0' -build 'O3' -path ${WDB_HOME}/src/apps/XXcode/main.xx -dbhost localhost:27017

# Annealing codes
$1 ${WDB_HOME}/bin/commit_executable.driver -class ising -owner 'ethz' -description 'Multi-spin code for range-1 interactions without magnetic field (approach one)' -algorithm 'SA' -name 'an_ms_r1_nf' -version '1.0.0' -build 'O3' -path ${WDB_HOME}/src/apps/anc/an_ms_r1_nf -dbhost localhost:27017

$1 ${WDB_HOME}/bin/commit_executable.driver -class ising -owner 'ethz' -description 'Multi-spin code for range-1 interactions with magnetic field (approach one)' -algorithm 'SA' -name 'an_ms_r1_fi' -version '1.0.0' -build 'O3' -path ${WDB_HOME}/src/apps/anc/an_ms_r1_fi -dbhost localhost:27017

$1 ${WDB_HOME}/bin/commit_executable.driver -class ising -owner 'ethz' -description 'Multi-spin code for range-3 interactions without magnetic field (approach one)' -algorithm 'SA' -name 'an_ms_r3_nf' -version '1.0.0' -build 'O3' -path ${WDB_HOME}/src/apps/anc/an_ms_r3_nf -dbhost localhost:27017

$1 ${WDB_HOME}/bin/commit_executable.driver -class ising -owner 'ethz' -description 'Multi-spin code for range-1 interactions without magnetic field (approach two)' -algorithm 'SA' -name 'an_ms_r1_nf_v0' -version '1.0.0' -build 'O3' -path ${WDB_HOME}/src/apps/anc/an_ms_r1_nf_v0 -dbhost localhost:27017

$1 ${WDB_HOME}/bin/commit_executable.driver -class ising -owner 'ethz' -description 'Single-spin code for general interactions with magnetic field (fixed number of neighbors)' -algorithm 'SA' -name 'an_ss_ge_fi' -version '1.0.0' -build 'O3' -path ${WDB_HOME}/src/apps/anc/an_ss_ge_fi -dbhost localhost:27017

$1 ${WDB_HOME}/bin/commit_executable.driver -class ising -owner 'ethz' -description 'Single-spin code for general interactions with magnetic field (any number of neighbors)' -algorithm 'SA' -name 'an_ss_ge_fi_vdeg' -version '1.0.0' -build 'O3' -path ${WDB_HOME}/src/apps/anc/an_ss_ge_fi_vdeg -dbhost localhost:27017

$1 ${WDB_HOME}/bin/commit_executable.driver -class ising -owner 'ethz' -description 'Single-spin code for general interactions on bipartite lattices without magnetic field (fixed number of neighbors)' -algorithm 'SA' -name 'an_ss_ge_nf_bp' -version '1.0.0' -build 'O3' -path ${WDB_HOME}/src/apps/anc/an_ss_ge_nf_bp -dbhost localhost:27017

$1 ${WDB_HOME}/bin/commit_executable.driver -class ising -owner 'ethz' -description 'Single-spin code for general interactions on bipartite lattices without magnetic field (any number of neighbors)' -algorithm 'SA' -name 'an_ss_ge_nf_bp_vdeg' -version '1.0.0' -build 'O3' -path ${WDB_HOME}/src/apps/anc/an_ss_ge_nf_bp_vdeg -dbhost localhost:27017

$1 ${WDB_HOME}/bin/commit_executable.driver -class ising -owner 'ethz' -description 'Single-spin code for range-n interactions with magnetic field (fixed number of neighbors)' -algorithm 'SA' -name 'an_ss_rn_fi' -version '1.0.0' -build 'O3' -path ${WDB_HOME}/src/apps/anc/an_ss_rn_fi -dbhost localhost:27017

$1 ${WDB_HOME}/bin/commit_executable.driver -class ising -owner 'ethz' -description 'Single-spin code for range-n interactions with magnetic field (any number of neighbors)' -algorithm 'SA' -name 'an_ss_rn_fi_vdeg' -version '1.0.0' -build 'O3' -path ${WDB_HOME}/src/apps/anc/an_ss_rn_fi_vdeg -dbhost localhost:27017

# Unitary evolution
$1 ${WDB_HOME}/bin/commit_executable.driver -class ising -owner 'ethz' -description 'General unitary evolution code for spin models' -algorithm 'UE' -name 'ue_solver' -version '1.0.0' -build 'O3' -path ${WDB_HOME}/src/apps/unitary_evolution_wrap/bin/ue_solver -dbhost localhost:27017

# Spin glass solver
$1 ${WDB_HOME}/bin/commit_executable.driver -class ising -owner 'ethz' -description 'General simulated annealing code for spin models' -algorithm 'SA' -name 'spin_glass_solver' -version '1.0.0' -build 'O3' -path ${WDB_HOME}/src/apps/spin_glass_solver/bin/main -dbhost localhost:27017
