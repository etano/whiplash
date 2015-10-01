# Usage

A convenient way to communitate with the database is using python. A
python demo can be found in
$(whiplash_root)/src/tests/demo_python.py. The pymongo
(https://api.mongodb.org/python/current/) python module is required.

## Loading models

Driver: commit_model.driver

Required arguments:

    -file FILENAME : the path to the model file
    -class PROBLEM_CLASS : the name of the model problem class
    -owner USER : user name of the model uploader

Optional arguments:

    -parent_id PARENT_ID : unique id of parent model
    -KEY VALUE : both key and value are specified by the user

Example:

    ./commit_model.driver -file apps/108problem.lat -class
    ising -owner akosenko -parent_id 8 -type quantum_speedup

## Loading executables

Driver: commit_executable.driver

Required arguments:

    -file FILENAME : the path to the executable file
    -class PROBLEM_CLASS : the name of the model problem class
    -owner USER : user name of the model uploader
    -description : brief description of the executable
    -algorithm : specification of the algorithm used
    -version : version number of the executable
    -build : special build flags used to compile the executable

Optional arguments:

    -KEY VALUE : both key and value are specified by the user

Example:

    ./commit_executable.driver -file apps/test.app -class
    ising -owner akosenko -description "This solver simply chooses
    random configurations and returns the lowest energy found"
    -algorithm "random" -version "1.0" -build "O3" -purpose "testing"

## Loading properties

Driver: commit_property.driver

Required arguments:

    -class PROBLEM_CLASS : the name of the model problem class
    -owner USER : user name of the model uploader
    -model MODEL_ID : unique id of the model to be solved
    -executable EXECUTABLE_ID : unique id of the executable used to solve the model

Optional arguments:

    -KEY VALUE : both key and value are specified by the user

Example:

    ./commit_property.driver -class ising -owner akosenko -model 0
    -executable 0 -Nr 7

## Querying

On the surface, querying an executable database appears similar to
querying a normal database. Here's an example in C++:

    #include "wdb.hpp"
    using wdb::odb::mongo::objectdb;
    using wdb::deployment::basic;

    int main(int argc, char* argv[]){
        // Initialize database and deployment
        objectdb db("cwave.ethz.ch:27017");
        basic deployment(db);

        // Create query object
        basic::object filter;
        basic::writer::prop("class", std::string("ising")) >> filter;

        // Query and print results
        for(const auto& result : deployment.query( filter, std::tie("cfg", "cost") ))
            std::cout << basic::reader::read<double>(*result, std::tie("cfg","cost") ) << std::endl;

        return 0;
    }

Notice we first create a filter on which to query, here all properties
with class "ising". Next we define which target we would like to
return, here "cost". Finally, we print out the results. Clearly one
does the same with a normal database.

The difference lies in the query function itself. If WhiplashDB finds
that the "cost" of any property of class "ising" is not yet computed,
it will automatically know how to compute it. It does so by using the
property's linked executable to operate on the property's linked
model.


