#ifndef WDB_ENTITIES_SAT_MODEL_HPP
#define WDB_ENTITIES_SAT_MODEL_HPP

namespace wdb { namespace entities { namespace sat {

    class model : public wdb::entities::dynamic_generic::model {
    public:
        model(std::ifstream& in)
            : wdb::entities::dynamic_generic::model(in)
        {
            this->class_ = "sat";
            this->class_id_ = 4; // TODO: Move this to a registry
        }

        model(const odb::iobject& o)
            : wdb::entities::dynamic_generic::model(o)
        {}
    };

} } }

#endif
