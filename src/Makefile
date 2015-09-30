SHELL := /bin/bash
CXXFLAGS?= -std=c++11 -O0 -Wall -pedantic -g -w -Wfatal-errors -I. -ldl `pkg-config --cflags --libs libmongocxx`

.DEFAULT: all
.PHONY: all clean install

# TODO: Make it so everything doens't have to recompile everytime

APPS = test.shared test.static
DRIVERS = commit_property.driver commit_model.driver commit_executable.driver format_db.driver query.driver worker.driver scheduler.driver
TESTS = fetch.test optional.test
PREFIX = ..

all: $(APPS) $(DRIVERS) $(TESTS)

%: %.cpp
	$(CXX) -o $(basename $<) $< $(CXXFLAGS)

%.shared : apps/%.cpp
	$(CXX) -fPIC -shared -o $(basename $<).shared $< $(CXXFLAGS)

%.static : apps/%.cpp
	$(CXX) -o $(basename $<).static $< $(CXXFLAGS)

%.driver : apps/drivers/%.cpp
	$(CXX) -o $(basename $<).driver $< $(CXXFLAGS)

%.test : tests/%.cpp
	$(CXX) -o $(basename $<).test $< $(CXXFLAGS)

clean:
	-rm -f apps/*.shared
	-rm -f apps/*.static
	-rm -f apps/drivers/*.driver
	-rm -f tests/*.test
	-rm -f ../bin/*.driver

install:
	mkdir -p $(DESTDIR)$(PREFIX)/bin
	cp -rf apps/*.shared $(DESTDIR)$(PREFIX)/bin
	cp -rf apps/*.static $(DESTDIR)$(PREFIX)/bin
	cp apps/drivers/*.driver $(DESTDIR)$(PREFIX)/bin
	cp tests/*.test $(DESTDIR)$(PREFIX)/bin
	mkdir -p $(DESTDIR)$(PREFIX)/lib/python
	cp apps/python/whiplashdb.py $(DESTDIR)$(PREFIX)/lib/python
