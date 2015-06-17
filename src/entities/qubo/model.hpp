#ifndef WDB_ENTITIES_QUBO_MODEL_HPP
#define WDB_ENTITIES_QUBO_MODEL_HPP

namespace wdb { namespace entities { namespace qubo {

    class model : public wdb::entities::dynamic_generic::model {
    public:
        model(std::ifstream& in)
            : wdb::entities::dynamic_generic::model(in)
        {
            this->class_ = "qubo";
            this->class_id_ = 3; // TODO: Move this to the factory
        }

        model(const odb::iobject& o)
            : wdb::entities::dynamic_generic::model(o)
        {}
    };

} } }

#endif
