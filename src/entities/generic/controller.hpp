#ifndef WDB_ENTITIES_GENERIC_CONTROLLER_HPP
#define WDB_ENTITIES_GENERIC_CONTROLLER_HPP

namespace wdb { namespace entities { namespace generic {

    class controller {
    public:
        controller(){}

        virtual ~controller() {};

        static void resolve(rte::iexecutable &x, entities::generic::model &m, entities::generic::property &p){
            p.set_state(property::resolution_state::PROCESSING);

            // {{{ Actually run the executable
            std::vector<std::string> params(p.get_params());
            int argc = 3 + params.size();
            void** argv = (void**)malloc(sizeof(void*)*argc);
            argv[1] = &m;
            argv[2] = &p;
            for(int i=0; i<params.size(); i++) argv[i+3] = &params[i];
            x(argc, (char**)argv);
            free(argv);
            // }}}

            p.set_state(property::resolution_state::DEFINED);
        }
    };

} } }

#endif
