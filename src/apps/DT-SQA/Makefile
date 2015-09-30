.PHONY: all clean

.DEFAULT: all

CXX = g++

WDBFLAGS = -I${WDB_HOME}/src -g -w -Wfatal-errors -ldl `pkg-config --cflags --libs libmongocxx`
CXXFLAGS = -Wall -ansi -pedantic -std=c++11 -O3 -funroll-loops -pipe $(WDBFLAGS)

TARGETS = dtsqa
TARGETS_STATIC = dtsqa.static

all: $(TARGETS) $(TARGETS_STATIC)

clean:
	rm -f $(TARGETS) $(TARGETS_STATIC)

$(TARGETS) : %: main.cpp
	$(CXX) $(CXXFLAGS) -fPIC -shared -o $@ $<

$(TARGETS_STATIC) : %: main.cpp
	$(CXX) $(CXXFLAGS) -o $@ $<
