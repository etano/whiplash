#include <mongocxx/client.hpp>
#include <mongocxx/instance.hpp>

#include "simfw.hpp"

int main(int, char**){
    mongocxx::instance inst{};
    mongocxx::client conn{mongocxx::uri("mongodb://cwave.ethz.ch:27017")};
    auto db = conn["simfw"];

    std::ifstream in("config.txt");
    simfw::odb::mongo::objectdb::insert_hamil(db, in);
    in.close();
}

