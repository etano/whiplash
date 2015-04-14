#include <mongocxx/client.hpp>
#include <mongocxx/instance.hpp>

#include "simfw.hpp"

int main(int, char**){
    mongocxx::instance inst{};
    mongocxx::client conn{mongocxx::uri("mongodb://cwave.ethz.ch:27017")};
    auto collection = conn["simfw"]["instances"];

    std::vector<std::string> params;
    params.push_back("7");
    params.push_back("13");

    simfw::odb::mongo::objectdb::insert_instance(collection, 18, "ising_s0", params);
}

