#ifndef WDB_ENTITIES_QUBO_PROPERTY_HPP
#define WDB_ENTITIES_QUBO_PROPERTY_HPP

namespace wdb { namespace entities { namespace qubo {

    class property : public wdb::entities::generic::property {
    public:
        property(std::string model_class, const odb::iobject& o)
            : wdb::entities::generic::property(model_class, o)
        {}

        property(std::string model_class, int model_id, int executable_id, const std::vector<std::string>& params, resolution_state state = resolution_state::UNDEFINED)
            : wdb::entities::generic::property(model_class, model_id, executable_id, params, state)
        {}

        virtual ~property() override {};
    };

} } }

#endif
