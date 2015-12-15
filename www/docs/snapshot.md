# Snapshot

Below we provide a snapshot of what is currently in the hosted [Whiplash](http://whiplash.ethz.ch) database.

## Models

Current models sorted by problem class. For a detailed description of the problem classes, see the [problem class standards](standards#problem-class-standards).

### ising

Current models of class ising sorted by type.

#### dfm

- `owner`: nasa
- `count`: 133
- `description`: The problem instances here correspond to binary and quaternary tree-like networks as those described in Fig. 1(a) of http://arxiv.org/abs/1406.7601. Each set of 0s and 1s below correspond to the set of sensor readouts which define each particular instance (one-per-line). The first row of each Ising\_...txt file has three numbers: 1) The number of qubits 2) The total number of nonzero entries in the h and J matrices 3) The constant term.

#### pq_2peaks

- `owner`: tamu
- `count`: 140
- `description`:

#### tsp

- `owner`: ethz
- `count`: 63
- `description`: All of TSPLIB translated to Ising spin problems. Note that solving the TSP problem requires an additional constraint.

## Executables

Current executables sorted by algorithm. For a detailed description of the algorithms, see the [algorithm standards](standards#algorithm-standards).

### SA

- `class`: ising
- `owner`: ethz
- `name`: an_ms_r1_nf
- `description`: Multi-spin code for range-1 interactions without magnetic field (approach one)

---

- `class`: ising
- `owner`: ethz
- `name`: an_ms_r1_fi
- `description`: Multi-spin code for range-1 interactions with magnetic field (approach one)

---

- `class`: ising
- `owner`: ethz
- `name`: an_ms_r3_nf
- `description`: Multi-spin code for range-3 interactions without magnetic field (approach one)

---

- `class`: ising
- `owner`: ethz
- `name`: an_ms_r1_nf_v0
- `description`: Multi-spin code for range-1 interactions without magnetic field (approach two)

---

- `class`: ising
- `owner`: ethz
- `name`: an_ss_ge_fi
- `description`: Single-spin code for general interactions with magnetic field (fixed number of neighbors)

---

- `class`: ising
- `owner`: ethz
- `name`: an_ss_ge_fi_vdeg
- `description`: Single-spin code for general interactions with magnetic field (any number of neighbors)

---

- `class`: ising
- `owner`: ethz
- `name`: an_ss_ge_nf_bp
- `description`: Single-spin code for general interactions on bipartite lattices without magnetic field (fixed number of neighbors)

---

- `class`: ising
- `owner`: ethz
- `name`: an_ss_ge_nf_bp_vdeg
- `description`: Single-spin code for general interactions on bipartite lattices without magnetic field (any number of neighbors)

---

- `class`: ising
- `owner`: ethz
- `name`: an_ss_rn_fi
- `description`: Single-spin code for range-n interactions with magnetic field (fixed number of neighbors)

---

- `class`: ising
- `owner`: ethz
- `name`: an_ss_rn_fi_vdeg
- `description`: Single-spin code for range-n interactions with magnetic field (any number of neighbors)

### SQA-PIMC

- `class`: ising
- `owner`: ethz
- `name`: dtsqa
- `description`: Discrete time simulated quantum annealing solver

### SQA-UE

- `class`: ising
- `owner`: ethz
- `name`: ue_solver
- `description`: General unitary evolution code for spin models
