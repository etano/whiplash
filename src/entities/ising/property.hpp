#ifndef WDB_ENTITIES_ISING_PROPERTY_HPP
#define WDB_ENTITIES_ISING_PROPERTY_HPP

namespace wdb { namespace entities { namespace ising {

    class property : public generic::property {
    public:
        property(const odb::iobject& o)
            : generic::property(o)
        {}

        property(int model_id, int executable_id, const std::vector<std::string>& params, resolution_state state = resolution_state::UNDEFINED)
            : generic::property(typename entities::info<type::ising>(), model_id, executable_id, params, state)
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
