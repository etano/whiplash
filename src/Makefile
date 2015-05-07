SHELL := /bin/bash
CXXFLAGS?= -std=c++11 -O0 -g -w -Wfatal-errors -I. `pkg-config --cflags --libs libmongocxx`

.DEFAULT: all
.PHONY: all clean

APPS = test.app
DRIVERS = commit_property.driver commit_h.driver fetch_h.driver fetch_property.driver query.driver worker.driver

all: $(DRIVERS) $(APPS)

%: %.cpp
	$(CXX) -o $(basename $<) $< $(CXXFLAGS)

%.app : apps/%.cpp
	$(CXX) -fPIC -shared -o $(basename $<).app $< $(CXXFLAGS)

%.driver : drivers/%.cpp
	$(CXX) -o $(basename $<).driver $< $(CXXFLAGS)

clean:
	-rm -f apps/*.app
	-rm -f drivers/*.driver
