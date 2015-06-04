SHELL := /bin/bash
CXXFLAGS?= -std=c++11 -O0 -g -w -Wfatal-errors -I. -ldl `pkg-config --cflags --libs libmongocxx`

.DEFAULT: all
.PHONY: all clean install

APPS = test.app
DRIVERS = fetch_unresolved_properties.driver commit_property.driver commit_model.driver commit_executable.driver fetch_model.driver fetch_property.driver init_db.driver query.driver worker.driver
DAEMONS = local.daemon
prefix = ..

all: $(DAEMONS) $(DRIVERS) $(APPS)

%: %.cpp
	$(CXX) -o $(basename $<) $< $(CXXFLAGS)

%.app : apps/%.cpp
	$(CXX) -fPIC -shared -o $(basename $<).app $< $(CXXFLAGS)

%.driver : drivers/%.cpp
	$(CXX) -o $(basename $<).driver $< $(CXXFLAGS)

%.daemon : rte/%.cpp
	$(CXX) -o $(basename $<).daemon $< $(CXXFLAGS)

clean:
	-rm -f apps/*.app
	-rm -f drivers/*.driver
	-rm -f rte/*.daemon

install:
	install -m 0755 apps/*.app $(prefix)/bin
	install -m 0755 drivers/*.driver $(prefix)/bin
	install -m 0755 rte/*.daemon $(prefix)/bin
