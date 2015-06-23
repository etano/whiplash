#ifndef WDB_ENTITIES_ISING_PROPERTY_HPP
#define WDB_ENTITIES_ISING_PROPERTY_HPP

namespace wdb { namespace entities { namespace ising {

    class property : public wdb::entities::generic::property {
    public:
        property(std::string model_class, const odb::iobject& o)
            : wdb::entities::generic::property(model_class, o)
        {}

        property(std::string model_class, int model_id, int executable_id, const std::vector<std::string>& params, resolution_state state = resolution_state::UNDEFINED)
            : wdb::entities::generic::property(model_class, model_id, executable_id, params, state)
        {}

        virtual ~property() override {};

        virtual void serialize_configuration(odb::iobject& configuration) override {
            if (state_ == resolution_state::UNDEFINED){
                writer::prop("config", std::vector<double>(1, std::numeric_limits<double>::quiet_NaN())) >> configuration;
                writer::prop("cost", std::numeric_limits<double>::quiet_NaN()) >> configuration;
            } else if (state_ == resolution_state::DEFINED){
                writer::prop("config", cfg_) >> configuration;
                writer::prop("cost", cost_) >> configuration;
            } else {
                throw std::runtime_error("Error: Property neither UNDEFINED nor DEFINED!\n");
            }
        }

        void set_configuration(const std::vector<bool>& cfg, double cost){
            cfg_ = cfg;
            cost_ = cost;
        }
    private:
        std::vector<bool> cfg_;
        double cost_;
    };

} } }

#endif
