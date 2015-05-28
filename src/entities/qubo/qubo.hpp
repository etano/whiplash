#ifndef WDB_ENTITIES_QUBO_HPP
#define WDB_ENTITIES_QUBO_HPP

namespace wdb { namespace entities { namespace qubo {

    class reader : public wdb::entities::dynamic_generic::reader {};

    class writer : public wdb::entities::dynamic_generic::writer {};

    class model : public wdb::entities::dynamic_generic::model {
    public:
        model(std::ifstream& in)
            : wdb::entities::dynamic_generic::model(in)
        {}

        model(const odb::iobject& o)
            : wdb::entities::dynamic_generic::model(o)
        {}
    };

    class property : public wdb::entities::dynamic_generic::property {
    public:
        property(const odb::iobject& o)
            : wdb::entities::dynamic_generic::property(o)
        {}

        property(int model_id, int executable_id, const std::vector<std::string>& params)
            : wdb::entities::dynamic_generic::property(model_id, executable_id, params)
        {}

    };

} } }

#endif

