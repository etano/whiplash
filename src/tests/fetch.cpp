#include "utils/testing.hpp"

TEST_CASE("Fetching model", "[model]"){
    wdb::odb::mongo::objectdb db(TEST_SERVER);
    wdb::deployment::basic f(db);

    REQUIRE(f.fetch_model(0)->get_class() == "ising");
}

TEST_CASE("Fetching defined property", "[property]"){
    wdb::odb::mongo::objectdb db(TEST_SERVER);
    wdb::deployment::basic f(db);

    REQUIRE(f.fetch_property(0)->is_defined() == true);
}
