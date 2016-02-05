Benchmark suite
===

Usage
---

To run the benchmark on development containers, do the following:

    docker-compose -f develop.yml build
    docker-compose -f develop.yml up -d
    ./benchmarks/bench.py ${DOCKERHOST:-localhost} 1337 test test

This will try to commit/query various collections, and finally make a whiplash-type query. Currently the final query takes ~250s.

Afterwards, it will print out the per function timings taken inside nodejs.

Finally, if you would like to see function timings in order, you can do:

    docker logs whiplash_api_dev_1

and look at the timestamps.
