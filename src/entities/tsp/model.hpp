#ifndef WDB_ENTITIES_TSP_MODEL_HPP
#define WDB_ENTITIES_TSP_MODEL_HPP

namespace wdb { namespace entities { namespace tsp {

    class model : public generic::model {
    public:
        model(std::string model_class, std::ifstream& in)
            : generic::model(model_class,in)
        {}

        model(std::string model_class, const odb::iobject& o)
            : generic::model(model_class,o)
        {}

        virtual ~model() override {};
    };

} } }

#endif
