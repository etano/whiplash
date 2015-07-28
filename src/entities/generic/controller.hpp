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

            wdb::timer wt("walltime"); wt.begin();
            x(argc, (char**)argv);
            free(argv);
            wt.end();

            p.set_status(property::status::DEFINED);
            p.set_walltime(wt.get_time());
        }
    };

} } }

#endif
