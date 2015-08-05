#ifndef WDB_ENTITIES_ISING_PROPERTY_HPP
#define WDB_ENTITIES_ISING_PROPERTY_HPP

namespace wdb { namespace entities { namespace ising {

    class property : public generic::property {
        typedef int64_t spin_type;
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
        }

        template<typename OtherSpinType>
        void set_cfg(const std::vector<OtherSpinType>& cfg, double cost){
            cfg_.clear();
            for (auto &spin : cfg)
                cfg_.push_back(spin);
            cost_ = cost;
        }
    private:
        std::vector<spin_type> cfg_;
        double cost_;
    };

} } }

#endif
