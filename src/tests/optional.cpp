#include "utils/testing.hpp"

TEST_CASE("Optional boolean: value", "[optional::bool]"){
    bool value;

    value = wdb::optional<bool>() or true;            REQUIRE(value == true);
    value = wdb::optional<bool>() or false;           REQUIRE(value == false);
    value = wdb::optional<bool>(true) or true;        REQUIRE(value == true);
    value = wdb::optional<bool>(true) or false;       REQUIRE(value == true);
    value = wdb::optional<bool>(false) or true;       REQUIRE(value == false);
    value = wdb::optional<bool>(false) or false;      REQUIRE(value == false);
}

TEST_CASE("Optional boolean: if", "[optional::bool]"){

    auto v1 = wdb::optional<bool>();                  REQUIRE((v1 ? true : false) == false);
    auto v2 = wdb::optional<bool>() or true;          REQUIRE((v2 ? true : false) == true);
    auto v3 = wdb::optional<bool>() or false;         REQUIRE((v3 ? true : false) == true);
    auto v4 = wdb::optional<bool>(true);              REQUIRE((v4 ? true : false) == true);
    auto v5 = wdb::optional<bool>(true) or true;      REQUIRE((v5 ? true : false) == true);
    auto v6 = wdb::optional<bool>(true) or false;     REQUIRE((v6 ? true : false) == true);
    auto v7 = wdb::optional<bool>(false);             REQUIRE((v7 ? true : false) == true);
    auto v8 = wdb::optional<bool>(false) or true;     REQUIRE((v8 ? true : false) == true);
    auto v9 = wdb::optional<bool>(false) or false;    REQUIRE((v9 ? true : false) == true);
}

TEST_CASE("Optional int: value", "[optional::int]"){
    int value;

    value = wdb::optional<int>() or 13;               REQUIRE(value == 13);
    value = wdb::optional<int>() or 0;                REQUIRE(value == 0);
    value = wdb::optional<int>(7) or 13;              REQUIRE(value == 7);
    value = wdb::optional<int>(7) or 0;               REQUIRE(value == 7);
    value = wdb::optional<int>(0) or 7;               REQUIRE(value == 0);
    value = wdb::optional<int>(0) or 0;               REQUIRE(value == 0);
}

TEST_CASE("Optional int: if", "[optional::int]"){

    auto v1 = wdb::optional<int>();                   REQUIRE((v1 ? true : false) == false);
    auto v2 = wdb::optional<int>() or 71;             REQUIRE((v2 ? true : false) == true);
    auto v3 = wdb::optional<int>() or 0;              REQUIRE((v3 ? true : false) == true);
    auto v4 = wdb::optional<int>(0);                  REQUIRE((v4 ? true : false) == true);
    auto v5 = wdb::optional<int>(13) or 23;           REQUIRE((v5 ? true : false) == true);
    auto v6 = wdb::optional<int>(32) or 0;            REQUIRE((v6 ? true : false) == true);
}

TEST_CASE("Casting: bool to int", "[optional::cast]"){

    struct detail {
        static wdb::optional<int> from_empty(){
            return wdb::optional<bool>();
        }
        static wdb::optional<int> from(bool value){
            return wdb::optional<bool>(value);
        }
    };

    REQUIRE( (detail::from_empty() ? true : false) == false ); int v1 = detail::from_empty() or 13; REQUIRE(v1 == 13);
    REQUIRE( (detail::from(true) ? true : false) == true );    int v2 = detail::from(true) or 7;    REQUIRE(v2 == 1);
    REQUIRE( (detail::from(false) ? true : false) == true );   int v3 = detail::from(false) or 7;   REQUIRE(v3 == 0);
}

TEST_CASE("Casting: derived types", "[optional::cast]"){

    struct A {
        A() : c(-1) { }
        A(int n) : c(n) { }
        int c;
    };
    struct B : A {
        B(int n) : A(0) { A::c = n; }
        B() { }
    };

    struct detail {
        static wdb::optional<A> upcast_empty(){
            return wdb::optional<B>();
        }
        static wdb::optional<A> upcast(int c){
            return wdb::optional<B>(c);
        }
    };

    REQUIRE( (detail::upcast_empty() ? true : false) == false ); A v1 = detail::upcast_empty() or A(7); REQUIRE(v1.c == 7);
    REQUIRE( (detail::upcast(13) ? true : false) == true );      A v2 = detail::upcast(13) or A(7);     REQUIRE(v2.c == 13);
}
