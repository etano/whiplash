# Local deployment example

In this example we commit a simulated annealing executable, create spin glass Ising models and commit them, submit jobs to be run on them and finally query for results.

NOTE: For every step the Python code is very readable, so the user is encouraged to review it before use.

The first step is to commit the executable, a simulated annealing Ising solver:

    ./commit_executable.py

Next create and commit some spin glass models:

    ./commit_models.py

Next create properties to be run and submit them to Whiplash:

    ./submit.py

While the properties are being resolved, you may check their status with:

    ./status.py

Finally, when all properties are finished running, you can query for specific results with:

    ./query.py
