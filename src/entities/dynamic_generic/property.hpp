#ifndef WDB_ENTITIES_DYNAMIC_GENERIC_PROPERTY_HPP
#define WDB_ENTITIES_DYNAMIC_GENERIC_PROPERTY_HPP

namespace wdb { namespace entities { namespace dynamic_generic {

    class property : public wdb::entities::generic::property {
    public:
        property(const odb::iobject& o) : wdb::entities::generic::property(o) {}
        property(int model_id, int executable_id, const std::vector<std::string>& params, resolution_state state = resolution_state::UNDEFINED)
            : wdb::entities::generic::property(model_id, executable_id, params, state)
        {}

        virtual void resolve(){
            state_ = resolution_state::WAITFORIT;

            // TODO: Actually run the executable

            state_ = resolution_state::DEFINED;
        }

        virtual void serialize_configuration(odb::iobject& configuration) override {}
    };

} } }

#endif
