mini_sim.o: mini_sim.cpp
	g++ mini_sim.cpp -c -Dmain=mini_sim_main

framework.o: framework.cpp
	g++ framework.cpp -c

all: framework.o mini_sim.o
	g++ framework.o mini_sim.o -o main

clean:
	rm framework.o
	rm mini_sim.o
	rm main

run:
	./main parameter1

.PHONY: clean
