#include "utils/testing.hpp"

TEST_CASE("Fetching defined property", "[property]"){
    wdb::odb::mongo::objectdb db(TEST_SERVER);
    wdb::deployment::basic sf(db);
    REQUIRE(sf.fetch_property(0)->is_defined() == true);
}
