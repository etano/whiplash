SHELL := /bin/bash
CXXFLAGS?= -std=c++11 -O0 -g -w -Wfatal-errors -I. -ldl `pkg-config --cflags --libs libmongocxx`

.DEFAULT: all
.PHONY: all clean install

# TODO: Make it so everything doens't have to recompile everytime

APPS = test.app
DRIVERS = commit_property.driver commit_model.driver commit_executable.driver fetch_model.driver init_db.driver query.driver worker.driver daemon.driver
TESTS = property.test optional.test
prefix = ..

all: $(APPS) $(DRIVERS) $(TESTS)

%: %.cpp
	$(CXX) -o $(basename $<) $< $(CXXFLAGS)

%.app : apps/%.cpp
	$(CXX) -fPIC -shared -o $(basename $<).app $< $(CXXFLAGS)

%.driver : apps/drivers/%.cpp
	$(CXX) -o $(basename $<).driver $< $(CXXFLAGS)

%.test : tests/%.cpp
	$(CXX) -o $(basename $<).test $< $(CXXFLAGS)

clean:
	-rm -f apps/*.app
	-rm -f apps/drivers/*.driver
	-rm -f tests/*.test

install:
	install -m 0755 apps/*.app $(prefix)/bin
	install -m 0755 apps/drivers/*.driver $(prefix)/bin
