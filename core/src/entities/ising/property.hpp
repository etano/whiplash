#ifndef WDB_ENTITIES_ISING_PROPERTY_HPP
#define WDB_ENTITIES_ISING_PROPERTY_HPP

namespace wdb { namespace entities { namespace ising {

    class property : public entities::property {
        using spin_type = int64_t;
    public:
        property(const odb::iobject& o)
            : entities::property(o)
        {}

        property(std::string owner, int model_id, int executable_id, optional<parameters> params, int seed, status s = status::UNDEFINED)
            : entities::property(typename entities::info<ptype::ising>(), owner, model_id, executable_id, params, seed, s)
        {}

        virtual ~property() override {};

        virtual void serialize_cfg(odb::iobject& cfg) override {
            if (status_ == status::UNDEFINED){
                writer::prop("spin_cfgs", std::vector<std::vector<double>>(1,std::vector<double>(1, std::numeric_limits<double>::quiet_NaN()))) >> cfg;
                writer::prop("costs", std::numeric_limits<double>::quiet_NaN()) >> cfg;
            } else if (status_ == status::DEFINED){
                writer::prop("spin_cfgs", spin_cfgs_) >> cfg;
                writer::prop("costs", costs_) >> cfg;
            } else {
                throw std::runtime_error("Error: Property neither UNDEFINED nor DEFINED!\n");
            }
        }

        template<typename OtherSpinType, typename OtherValueType>
        void set_cfg(const std::vector<OtherSpinType>& cfg, OtherValueType cost){
            set_cfg(std::vector<std::vector<OtherSpinType>>{cfg}, std::vector<OtherValueType>{cost});
        }

        template<typename OtherSpinType, typename OtherValueType>
        void set_cfg(const std::vector<std::vector<OtherSpinType>>& spin_cfgs, std::vector<OtherValueType> costs){
            spin_cfgs_.clear();
            for (const auto& spin_cfg : spin_cfgs){
                std::vector<spin_type> spin_cfg_;
                for (const auto& spin : spin_cfg)
                    spin_cfg_.push_back(spin);
                spin_cfgs_.push_back(spin_cfg_);
            }
            costs_.clear();
            for (const auto& cost : costs)
                costs_.push_back(cost);

            if(factory::is_offline()){
                odb::mongo::object obj_cfg; // FIXME: abstract away mongo
                serialize_cfg(obj_cfg);
                print_json(obj_cfg);
            }
        }

    private:
        std::vector<std::vector<spin_type>> spin_cfgs_;
        std::vector<double> costs_;
    };

} } }

#endif
