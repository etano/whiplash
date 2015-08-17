#ifndef WDB_ENTITIES_GENERIC_CONTROLLER_HPP
#define WDB_ENTITIES_GENERIC_CONTROLLER_HPP

namespace wdb { namespace entities {

    class controller : public wdb::rte::icontroller_delegate, public wdb::rte::icacheable {
    public:
        controller(){}
        virtual ~controller() {};

        virtual void resolve(rte::iexecutable& x, rte::icacheable& m, rte::icacheable& p_) override {
            auto& p = static_cast<property&>(p_);
            if(!p.is_undefined()) throw std::runtime_error("Error: property is already defined");
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

        virtual void finalize(rte::icacheable& p_, odb::iobject& record, odb::iobject& cfg){
            auto& p = static_cast<property&>(p_);
            p.serialize_cfg(cfg);
            p.serialize(record, cfg);
        }

        virtual void prepare_for_segue(icontroller_delegate& dest) override {
            printf("Preparing for segue...\n");
        }
    };

} }

#endif
