#include "utils/testing.hpp"

TEST_CASE("Fetching model", "[model]"){
    framework f(TEST_DBHOST);
    REQUIRE(f.fetch_model(0)->get_class() == "ising");
}

TEST_CASE("Fetching defined property", "[property]"){
    framework f(TEST_DBHOST);
    REQUIRE(f.fetch_property(0)->is_defined() == true);
}