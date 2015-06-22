#ifndef WDB_ENTITIES_DYNAMIC_GENERIC_PROPERTY_HPP
#define WDB_ENTITIES_DYNAMIC_GENERIC_PROPERTY_HPP

namespace wdb { namespace entities { namespace dynamic_generic {

    class property : public wdb::entities::generic::property {
    public:
        property(std::string model_class, const odb::iobject& o) : wdb::entities::generic::property(model_class, o) {}
        property(std::string model_class, int model_id, int executable_id, const std::vector<std::string>& params, resolution_state state = resolution_state::UNDEFINED)
            : wdb::entities::generic::property(model_class, model_id, executable_id, params, state)
        {}
        virtual ~property() override {};

        virtual void resolve(rte::iexecutable &x, const model &m) {
            // Begin resolution
            state_ = resolution_state::PROCESSING;

            // Actually run the executable
            // TODO Compose argc and params and run
            // x(argc, (char**)params);

            // Finished
            state_ = resolution_state::DEFINED;
        }

        virtual void serialize_configuration(odb::iobject& configuration) override {}
    };

} } }

#endif
