#ifndef WDB_ENTITIES_GENERIC_CONTROLLER_HPP
#define WDB_ENTITIES_GENERIC_CONTROLLER_HPP

namespace wdb { namespace entities { namespace generic {

    class controller {
    public:
        controller(){}

        virtual ~controller() {};

        virtual void resolve(rte::iexecutable &x, entities::generic::model &m, entities::generic::property &p){
            // Begin resolution
            state_ = resolution_state::PROCESSING;

            // Actually run the executable
            int argc = 3 + params_.size();
            void** argv = (void**)malloc(sizeof(void*)*argc);
            argv[1] = &m;
            argv[2] = &p;
            for(int i=0; i<params_.size(); i++) argv[i+3] = &params_[i];
            x(argc, (char**)argv);
            free(argv);

            // Finished
            state_ = resolution_state::DEFINED;
        }
    };

} } }

#endif
