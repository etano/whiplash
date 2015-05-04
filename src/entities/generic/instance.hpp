#ifndef SIMFW_ENTITIES_GENERIC_INSTANCE_HPP
#define SIMFW_ENTITIES_GENERIC_INSTANCE_HPP

namespace simfw { namespace entities { namespace generic {

    using simfw::odb::mongo::prop_reader;
    using simfw::odb::mongo::prop_writer;

    class instance {
    public:
        instance(const odb::iobject& o){
            const auto& obj = static_cast<const odb::mongo::object&>(o);
            h_      = prop_reader::Int(obj, "hid");
            solver_ = prop_reader::String(obj, "solver");
            for(auto e : prop_reader::Array(obj, "params"))
                params_.push_back(prop_reader::String(e));
        }

        void info(){
            std::cout << "H: " << h_ << "\n";
            std::cout << "Solver: " << solver_ << "\n";
            std::cout << "Params: "; for(auto e : params_) std::cout << e << " ";
            std::cout << "\n";
        }

        template<int N>
        std::string param(){
            return params_[N];
        }

        instance(int hid, std::string solver, const std::vector<std::string>& params) 
            : h_(hid),
            solver_(solver),
            params_(params)
        {
        }

        void serialize_state(odb::iobject& state){
            // todo // save the actual state
            prop_writer::prop("config", std::vector<double>(1, std::numeric_limits<double>::quiet_NaN())) >> state;
            prop_writer::prop("cost", std::numeric_limits<double>::quiet_NaN()) >> state;
        }

        void serialize(int id, odb::iobject& inst, const odb::iobject& state){
            prop_writer::prop("_id", id) >> inst;
            prop_writer::prop("hid", h_) >> inst;
            prop_writer::prop("solver", solver_) >> inst;
            prop_writer::prop("params", params_) >> inst;
            prop_writer::prop("state", state) >> inst;
        }
    private:
        int h_;
        std::string solver_;
        std::vector<std::string> params_;
    };

} } }

#endif
