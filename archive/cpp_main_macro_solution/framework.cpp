// Author:  Mario S. Könz <mskoenz@gmx.net>
// Date:    23.03.2015 09:35:01 CET
// File:    framework.cpp

#include <iostream>

extern int mini_sim_main(int argc, char* argv[]);

int main(int argc, char* argv[]) {
    //repeat mini_sim as many times as you want w/o bash
    mini_sim_main(argc, argv);
    return 0;
}
