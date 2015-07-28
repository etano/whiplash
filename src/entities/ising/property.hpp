#ifndef WDB_ENTITIES_ISING_PROPERTY_HPP
#define WDB_ENTITIES_ISING_PROPERTY_HPP

namespace wdb { namespace entities { namespace ising {

    class property : public generic::property {
    public:
        property(const odb::iobject& o)
            : generic::property(o)
        {}

        property(int model_id, int executable_id, const std::vector<std::string>& params, int seed, status s = status::UNDEFINED)
            : generic::property(typename entities::info<type::ising>(), model_id, executable_id, params, seed, s)
        {}

        virtual ~property() override {};

        virtual void serialize_configuration(odb::iobject& configuration) override {
            if (status_ == status::UNDEFINED){
                writer::prop("config", std::vector<double>(1, std::numeric_limits<double>::quiet_NaN())) >> configuration;
                writer::prop("cost", std::numeric_limits<double>::quiet_NaN()) >> configuration;
            } else if (status_ == status::DEFINED){
                writer::prop("config", cfg_) >> configuration;
                writer::prop("cost", cost_) >> configuration;
            } else {
                throw std::runtime_error("Error: Property neither UNDEFINED nor DEFINED!\n");
            }
            generic::property::serialize_configuration(configuration);
        }

        void set_configuration(const std::vector<int>& cfg, double cost){
            cfg_ = cfg;
            cost_ = cost;
        }
    private:
        std::vector<int> cfg_;
        double cost_;
    };

} } }

#endif
