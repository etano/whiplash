.PHONY: all clean

.DEFAULT: all

CXX = g++

WDBFLAGS = -I${WDB_HOME}/src -g -w -Wfatal-errors -ldl `pkg-config --cflags --libs libmongocxx`
CXXFLAGS = -Wall -ansi -pedantic -std=c++11 -O3 -funroll-loops -pipe $(WDBFLAGS)

TARGETS = dtsqa

all: $(TARGETS)

clean:
	rm -f $(TARGETS)

$(TARGETS) : %: main.cpp
	$(CXX) $(CXXFLAGS) -fPIC -shared -o $@ $<
