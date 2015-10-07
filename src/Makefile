SHELL := /bin/bash
CXXFLAGS?= -std=c++11 -O0 -Wall -pedantic -g -w -Wfatal-errors -I. -ldl `pkg-config --cflags --libs libmongocxx`

.DEFAULT: all
.PHONY: all clean install

APPS = test_app.shared test_app.static
DRIVERS = worker.driver scheduler.driver format_db.driver
TESTS = fetch.test optional.test
PREFIX = ..

all: $(APPS) $(DRIVERS) $(TESTS)

%: %.cpp
	$(CXX) -o $(basename $<) $< $(CXXFLAGS)

%.shared : tests/%.cpp
	$(CXX) -fPIC -shared -o $(basename $<).shared $< $(CXXFLAGS)

%.static : tests/%.cpp
	$(CXX) -o $(basename $<).static $< $(CXXFLAGS)

%.driver : drivers/%.cpp
	$(CXX) -o $(basename $<).driver $< $(CXXFLAGS)

%.test : tests/%.cpp
	$(CXX) -o $(basename $<).test $< $(CXXFLAGS)

clean:
	-rm -f drivers/*.driver
	-rm -f tests/*.shared
	-rm -f tests/*.static
	-rm -f tests/*.test
	-rm -f ../bin/*

install:
	mkdir -p $(DESTDIR)$(PREFIX)/bin
	cp -rf tests/*.shared $(DESTDIR)$(PREFIX)/bin
	cp -rf tests/*.static $(DESTDIR)$(PREFIX)/bin
	cp drivers/*.driver $(DESTDIR)$(PREFIX)/bin
	cp tests/*.test $(DESTDIR)$(PREFIX)/bin
	mkdir -p $(DESTDIR)$(PREFIX)/lib/python
	cp drivers/python/*.py $(DESTDIR)$(PREFIX)/lib/python
