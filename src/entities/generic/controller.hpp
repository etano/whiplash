#ifndef WDB_ENTITIES_GENERIC_CONTROLLER_HPP
#define WDB_ENTITIES_GENERIC_CONTROLLER_HPP

namespace wdb { namespace entities { namespace generic {

    class controller : public wdb::rte::icontroller {
    public:
        controller(){}

        virtual ~controller() {};

        static void resolve(rte::iexecutable &x, model &m, property &p){
            p.set_status(property::status::PROCESSING);

            std::vector<std::string> params(p.get_params());
            int argc = 3 + params.size();
            void** argv = (void**)malloc(sizeof(void*)*argc);
            argv[1] = &m;
            argv[2] = &p;
            for(int i = 0; i < params.size(); i++) argv[i+3] = &params[i];

            double t0(get_time());
            x(argc, (char**)argv);
            free(argv);
            double t1(get_time());
            std::cout << t1-t0 << std::endl;

            p.set_status(property::status::DEFINED);
            p.set_walltime(t1-t0);
        }

        static double get_time()
        {
            struct timeval tv;
            if (gettimeofday(&tv, NULL) != 0)
                return 0.0;
            else
                return tv.tv_sec + 1e-6 * tv.tv_usec;
        }

    };

} } }

#endif
