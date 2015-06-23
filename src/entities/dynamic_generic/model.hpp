#ifndef WDB_ENTITIES_DYNAMIC_GENERIC_MODEL_HPP
#define WDB_ENTITIES_DYNAMIC_GENERIC_MODEL_HPP

namespace wdb { namespace entities { namespace dynamic_generic {

    class model : public wdb::entities::generic::model {
    public:
        model(std::string model_class, std::ifstream& in) : wdb::entities::generic::model(model_class,in) {}
        model(std::string model_class, const odb::iobject& o) : wdb::entities::generic::model(model_class,o) {}
        virtual ~model() override {};

        virtual void print() override { std::cout << "print not defined" << std::endl; }

        virtual void serialize_configuration(odb::iobject& configuration) override {}
    };

} } }

#endif
