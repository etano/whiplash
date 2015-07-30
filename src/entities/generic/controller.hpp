#ifndef WDB_ENTITIES_GENERIC_CONTROLLER_HPP
#define WDB_ENTITIES_GENERIC_CONTROLLER_HPP

namespace wdb { namespace entities { namespace generic {

    class controller : public wdb::rte::icontroller_delegate<model,property>, public wdb::rte::icacheable {
    public:
        controller(){}
        virtual ~controller() {};

        virtual void resolve(rte::iexecutable &x, model &m, property &p) override {
            p.set_status(property::status::PROCESSING);

            int argc = 3;
            void** argv = (void**)malloc(sizeof(void*)*argc);
            argv[1] = &m;
            argv[2] = &p;

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
