#!/usr/bin/env python3
import whiplash

print("Login as test user")
db = whiplash.db("localhost", 1337, username="test", password="test")

print("Commit simulated annealling solver")
print(db.executables.commit({
    "name": "an_ss_ge_fi_vdeg",
    "algorithm": "SA",
    "version": "1.0",
    "type": "docker",
    "path": "whiplash/anc:an_ss_ge_fi_vdeg",
    "description": "Single-spin code for general interactions with magnetic field (any number of neighbors)",
    "params": {
        "required": ["edges", "n_sweeps", "n_reps"],
        "optional": ["seed", "T_0", "T_1", "rep_0", "verbose", "lowest", "schedule"]
    }
}))
