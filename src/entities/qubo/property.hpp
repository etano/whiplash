#ifndef WDB_ENTITIES_QUBO_PROPERTY_HPP
#define WDB_ENTITIES_QUBO_PROPERTY_HPP

namespace wdb { namespace entities { namespace qubo {

    class property : public generic::property {
    public:
        property(const odb::iobject& o)
            : generic::property(o)
        {}

        property(int model_id, int executable_id, const std::vector<std::string>& params, resolution_state state = resolution_state::UNDEFINED)
            : generic::property(typename entities::info<type::qubo>(), model_id, executable_id, params, state)
        {}

        virtual ~property() override {};
    };

} } }

#endif
