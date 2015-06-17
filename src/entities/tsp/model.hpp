#ifndef WDB_ENTITIES_TSP_MODEL_HPP
#define WDB_ENTITIES_TSP_MODEL_HPP

namespace wdb { namespace entities { namespace tsp {

    class model : public wdb::entities::dynamic_generic::model {
    public:
        model(std::ifstream& in)
            : wdb::entities::dynamic_generic::model(in)
        {
            this->class_ = "tsp";
            this->class_id_ = 2; // TODO: Move this to the factory
        }

        model(const odb::iobject& o)
            : wdb::entities::dynamic_generic::model(o)
        {}
    };

} } }

#endif
