#ifndef WDB_ENTITIES_GENERIC_CONTROLLER_HPP
#define WDB_ENTITIES_GENERIC_CONTROLLER_HPP

namespace wdb { namespace entities {

    class controller : public wdb::rte::icontroller_delegate, public wdb::rte::icacheable {
    public:
        controller(){}
        virtual ~controller() {};

        virtual void resolve(odb::iobject& obj, rte::ipool& pool){

            auto p = factory::make_entity<etype::property>(obj);
            auto m = factory::make_entity<etype::model>(p->get_model());
            auto x = factory::make_entity<etype::executable>(p->get_executable());

            if(!p->is_undefined()) throw std::runtime_error("Error: property is already defined");
            p->set_status(property::status::PROCESSING);

            int argc = 3;
            void** argv = (void**)malloc(sizeof(void*)*argc);
            argv[1] = &*m;
            argv[2] = &*p;

            wdb::timer wt("walltime"); wt.begin();
            (*x)(argc, (char**)argv);
            free(argv);
            wt.end();

            p->set_status(property::status::DEFINED);
            p->set_walltime(wt.get_time());

            pool.submit(obj, *p);
        }

        virtual void prepare_for_segue(icontroller_delegate& dest) override {
            printf("Preparing for segue...\n");
        }
    };

} }

#endif
