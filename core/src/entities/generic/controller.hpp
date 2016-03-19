#ifndef WDB_ENTITIES_GENERIC_CONTROLLER_HPP
#define WDB_ENTITIES_GENERIC_CONTROLLER_HPP

namespace wdb {

    template<typename T>
    void push(T& obj, int& argc, char**& argv);

}

namespace wdb { namespace entities {

    class controller : public wdb::rte::icontroller_delegate, public wdb::rte::icacheable {
    public:
        controller(){}
        virtual ~controller() {};

        virtual void resolve(odb::iobject& obj, rte::ipool& pool){
            int argc = 0;
            char** argv = NULL;

            auto p = factory::make<etype::property>(obj);
            auto m = factory::make<etype::model>(p->get_model());
            auto x = factory::make<etype::executable>(p->get_executable());

            if(!p->is_defined() and !p->is_processing()){
                p->set_status(property::status::PROCESSING);
                pool.process(obj);

                push<model>(*m, argc, argv);
                push<property>(*p, argc, argv);

                wdb::timer wt("walltime"); wt.begin();
                (*x)(-1, argv);
                free(argv);
                wt.end();

                p->set_status(property::status::DEFINED);
                p->set_walltime(wt.get_time());

                pool.push(obj, *p);
            }
        }

        virtual void prepare_for_segue(icontroller_delegate& dest) override {
            printf("Preparing for segue...\n");
        }
    };

} }

#endif
