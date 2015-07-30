#ifndef WDB_ENTITIES_ISING_PROPERTY_HPP
#define WDB_ENTITIES_ISING_PROPERTY_HPP

namespace wdb { namespace entities { namespace ising {

    class property : public generic::property {
    public:
        property(const odb::iobject& o)
            : generic::property(o)
        {}

        property(int model_id, int executable_id, const std::unordered_map<std::string,std::string>& params, int seed, status s = status::UNDEFINED)
            : generic::property(typename entities::info<ptype::ising>(), model_id, executable_id, params, seed, s)
        {}

        virtual ~property() override {};

        virtual void serialize_cfg(odb::iobject& cfg) override {
            if (status_ == status::UNDEFINED){
                writer::prop("spins", std::vector<double>(1, std::numeric_limits<double>::quiet_NaN())) >> cfg;
                writer::prop("cost", std::numeric_limits<double>::quiet_NaN()) >> cfg;
            } else if (status_ == status::DEFINED){
                writer::prop("spins", cfg_) >> cfg;
                writer::prop("cost", cost_) >> cfg;
            } else {
                throw std::runtime_error("Error: Property neither UNDEFINED nor DEFINED!\n");
            }
            generic::property::serialize_cfg(cfg);
        }

        void set_cfg(const std::vector<int>& cfg, double cost){
            cfg_ = cfg;
            cost_ = cost;
        }
    private:
        std::vector<int> cfg_;
        double cost_;
    };

} } }

#endif
