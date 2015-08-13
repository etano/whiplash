#ifndef WDB_ENTITIES_ISING_PROPERTY_HPP
#define WDB_ENTITIES_ISING_PROPERTY_HPP

namespace wdb { namespace entities { namespace ising {

    class property : public entities::property {
        typedef int64_t spin_type;
    public:
        property(const odb::iobject& o)
            : entities::property(o)
        {}

        property(int model_id, int executable_id, optional<parameters> params, int seed, status s = status::UNDEFINED)
            : entities::property(typename entities::info<ptype::ising>(), model_id, executable_id, params, seed, s)
        {}

        virtual ~property() override {};

        virtual void serialize_cfg(odb::iobject& cfg) override {
            if (status_ == status::UNDEFINED){
                writer::prop("cfgs", std::vector<std::vector<double>>(1,std::vector<double>(1, std::numeric_limits<double>::quiet_NaN()))) >> cfg;
                writer::prop("costs", std::numeric_limits<double>::quiet_NaN()) >> cfg;
            } else if (status_ == status::DEFINED){
                writer::prop("cfgs", cfgs_) >> cfg;
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
        void set_cfg(const std::vector<std::vector<OtherSpinType>>& cfgs, std::vector<OtherValueType> costs){
            cfgs_.clear();
            for (const auto &cfg : cfgs){
                std::vector<spin_type> cfg_;
                for (const auto &spin : cfg)
                    cfg_.push_back(spin);
                cfgs_.push_back(cfg_);
            }
            costs_.clear();
            for (const auto &cost : costs)
                costs_.push_back(cost);
        }
    private:
        std::vector<std::vector<spin_type>> cfgs_;
        std::vector<double> costs_;
    };

} } }

#endif
