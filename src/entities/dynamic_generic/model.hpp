#ifndef WDB_ENTITIES_DYNAMIC_GENERIC_MODEL_HPP
#define WDB_ENTITIES_DYNAMIC_GENERIC_MODEL_HPP

namespace wdb { namespace entities { namespace dynamic_generic {

    class model : public wdb::entities::generic::model {
    public:
        model(std::ifstream& in) : wdb::entities::generic::model(in) {}
        model(const odb::iobject& o) : wdb::entities::generic::model(o) {}
        virtual void print(){std::cout << "print not defined" << std::endl;}
    };

} } }

#endif
