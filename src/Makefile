SHELL := /bin/bash
CXXFLAGS?= -std=c++11 -O0 -g -w -Wfatal-errors -I. -ldl `pkg-config --cflags --libs libmongocxx`

.DEFAULT: all
.PHONY: all clean install

# TODO: Make it so everything doens't have to recompile everytime

APPS = test.app
DRIVERS = commit_property.driver commit_model.driver commit_executable.driver fetch_model.driver fetch_property.driver init_db.driver query.driver resolve_properties.driver worker.driver daemon.driver
prefix = ..

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

install:
	install -m 0755 apps/*.app $(prefix)/bin
	install -m 0755 drivers/*.driver $(prefix)/bin
