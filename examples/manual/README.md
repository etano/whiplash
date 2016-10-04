# Local deployment example

In this example we assume all work has been run outside of the Whiplash framework, but using a Whiplash compatible solver. Then all the user wants to do is commit back to Whiplash the work that was run

NOTE: For every step the Python code is very readable, so the user is encouraged to review it before use. To see the Python manual use:

    help(whiplash)

For each solver, there is a specified input/output format (see their associated README.md file). Generating the appropriate inputs can be done either manually or automatically, but must comply with this format.

NOTE: Be sure to keep copies of the input files as they will be needed to report results.

After the solver has been run through

    ./solver input.json

or

    docker run -v $PWD:/input solver:latest /input/input.json

the input file will be overwritten with the output. These results with their input must then be pushed back to the database together.

Next make sure the appropriate solver is registered as an executable by editing commit_executable.py and running:

    ./commit_executable.py

Record the returned ID of the executable and push the results with the input back into the Whiplash database

    ./commit_result.py input.json executable_id output.json

for each run.
