#ifndef WDB_UTILS_TIMER
#define WDB_UTILS_TIMER

#include <iostream>
#include <chrono>

namespace wdb {

    class timer {
    public:
        timer(std::string name): val(0.0), name(name), count(0){}
       ~timer(){
            std::cerr << name << " " << val << ", count : " << count << "\n";
        }
        void begin(){
            this->t0 = std::chrono::system_clock::now();
        }
        void end(){
            this->val += std::chrono::duration<double>(std::chrono::system_clock::now() - this->t0).count();
            count++;
        }
        double get_time() const {
            return val;
        }
        static double now(){
            struct timeval tv;
            return (gettimeofday(&tv, NULL) != 0) ? 0.0 : (tv.tv_sec + 1e-6 * tv.tv_usec);
        }
    private:
        double val;
        std::chrono::time_point<std::chrono::system_clock> t0;
        unsigned long long count;
        std::string name;
    };

}

#endif
