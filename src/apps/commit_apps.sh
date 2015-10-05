#!/bin/bash

# ${1} : dbhost

# Discrete time SQA
./bin/commit_executable.driver -class ising -owner 'ethz' -description 'A discrete time simulated quantum annealing solver' -algorithm 'SQA' -name 'dtsqa' -version '1.0.0' -build 'O3' -path ./bin/dtsqa.shared -dbhost ${1}

# XX Solver
./bin/commit_executable.driver -class ising -owner 'ethz' -description 'A looper algorithm implementation with the ability to treat XX couplings' -algorithm 'looper' -name 'XXcode' -version '1.0.0' -build 'O3' -path ./bin/xx.app -dbhost ${1}

# Annealing codes
./bin/commit_executable.driver -class ising -owner 'ethz' -description 'Multi-spin code for range-1 interactions without magnetic field (approach one)' -algorithm 'SA' -name 'an_ms_r1_nf' -version '1.0.0' -build 'O3' -path ./bin/an_ms_r1_nf.shared -dbhost ${1}

./bin/commit_executable.driver -class ising -owner 'ethz' -description 'Multi-spin code for range-1 interactions with magnetic field (approach one)' -algorithm 'SA' -name 'an_ms_r1_fi' -version '1.0.0' -build 'O3' -path ./bin/an_ms_r1_fi.shared -dbhost ${1}

./bin/commit_executable.driver -class ising -owner 'ethz' -description 'Multi-spin code for range-3 interactions without magnetic field (approach one)' -algorithm 'SA' -name 'an_ms_r3_nf' -version '1.0.0' -build 'O3' -path ./bin/an_ms_r3_nf.shared -dbhost ${1}

./bin/commit_executable.driver -class ising -owner 'ethz' -description 'Multi-spin code for range-1 interactions without magnetic field (approach two)' -algorithm 'SA' -name 'an_ms_r1_nf_v0' -version '1.0.0' -build 'O3' -path ./bin/an_ms_r1_nf_v0.shared -dbhost ${1}

./bin/commit_executable.driver -class ising -owner 'ethz' -description 'Single-spin code for general interactions with magnetic field (fixed number of neighbors)' -algorithm 'SA' -name 'an_ss_ge_fi' -version '1.0.0' -build 'O3' -path ./bin/an_ss_ge_fi.shared -dbhost ${1}

./bin/commit_executable.driver -class ising -owner 'ethz' -description 'Single-spin code for general interactions with magnetic field (any number of neighbors)' -algorithm 'SA' -name 'an_ss_ge_fi_vdeg' -version '1.0.0' -build 'O3' -path ./bin/an_ss_ge_fi_vdeg.shared -dbhost ${1}

./bin/commit_executable.driver -class ising -owner 'ethz' -description 'Single-spin code for general interactions on bipartite lattices without magnetic field (fixed number of neighbors)' -algorithm 'SA' -name 'an_ss_ge_nf_bp' -version '1.0.0' -build 'O3' -path ./bin/an_ss_ge_nf_bp.shared -dbhost ${1}

./bin/commit_executable.driver -class ising -owner 'ethz' -description 'Single-spin code for general interactions on bipartite lattices without magnetic field (any number of neighbors)' -algorithm 'SA' -name 'an_ss_ge_nf_bp_vdeg' -version '1.0.0' -build 'O3' -path ./bin/an_ss_ge_nf_bp_vdeg.shared -dbhost ${1}

./bin/commit_executable.driver -class ising -owner 'ethz' -description 'Single-spin code for range-n interactions with magnetic field (fixed number of neighbors)' -algorithm 'SA' -name 'an_ss_rn_fi' -version '1.0.0' -build 'O3' -path ./bin/an_ss_rn_fi.shared -dbhost ${1}

./bin/commit_executable.driver -class ising -owner 'ethz' -description 'Single-spin code for range-n interactions with magnetic field (any number of neighbors)' -algorithm 'SA' -name 'an_ss_rn_fi_vdeg' -version '1.0.0' -build 'O3' -path ./bin/an_ss_rn_fi_vdeg.shared -dbhost ${1}

# Unitary evolution
./bin/commit_executable.driver -class ising -owner 'ethz' -description 'General unitary evolution code for spin models' -algorithm 'UE' -name 'ue_solver' -version '1.0.0' -build 'O3' -path ./bin/ue_solver.shared -dbhost ${1}

# Spin glass solver
./bin/commit_executable.driver -class ising -owner 'ethz' -description 'General simulated annealing code for spin models' -algorithm 'SA' -name 'spin_glass_solver' -version '1.0.0' -build 'O3' -path ./bin/spin_glass_solver -dbhost ${1}
