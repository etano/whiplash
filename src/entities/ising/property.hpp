#ifndef WDB_ENTITIES_ISING_PROPERTY_HPP
#define WDB_ENTITIES_ISING_PROPERTY_HPP

namespace wdb { namespace entities { namespace ising {

    class property : public wdb::entities::dynamic_generic::property {
    public:
        property(const odb::iobject& o)
            : wdb::entities::dynamic_generic::property(o)
        {}

        property(int model_id, int executable_id, const std::vector<std::string>& params, resolution_state state = resolution_state::UNDEFINED)
            : wdb::entities::dynamic_generic::property(model_id, executable_id, params, state)
        {}

        virtual void serialize_configuration(odb::iobject& configuration){
            // todo // save the actual configuration
            writer::prop("config", std::vector<double>(1, std::numeric_limits<double>::quiet_NaN())) >> configuration;
            writer::prop("cost", std::numeric_limits<double>::quiet_NaN()) >> configuration;
        }
    };

} } }

#endif
