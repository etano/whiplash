#ifndef WDB_ENTITIES_GENERIC_PROPERTY_HPP
#define WDB_ENTITIES_GENERIC_PROPERTY_HPP

namespace wdb { namespace entities { namespace generic {

    class property {
    public:
        property(const odb::iobject& o){
            const auto& obj = static_cast<const odb::mongo::object&>(o);
            model_      = reader::Int(obj, "model_id");
            executable_ = reader::Int(obj, "executable_id");
            resolution_state_ = reader::String(obj, "resolution_state");
            for(auto e : reader::Array(obj, "params"))
                params_.push_back(reader::String(e));
        }

        void info(){
            std::cout << "Model: " << model_ << "\n";
            std::cout << "Executable: " << executable_ << "\n";
            std::cout << "Resolution state: " << resolution_state_ << "\n";
            std::cout << "Params: "; for(auto e : params_) std::cout << e << " ";
            std::cout << "\n";
        }

        template<int N>
        std::string param(){
            return params_[N];
        }

        property(int model_id, int executable_id, const std::vector<std::string>& params, std::string resolution_state)
            : model_(model_id), executable_(executable_id), params_(params), resolution_state_(resolution_state)
        {}

        virtual void resolve() {};

        virtual void serialize_state(odb::iobject& state) {}

        void serialize(odb::iobject& inst, const odb::iobject& state){
            writer::prop("model_id", model_) >> inst;
            writer::prop("executable_id", executable_) >> inst;
            writer::prop("resolution_state", resolution_state_) >> inst;
            writer::prop("params", params_) >> inst;
            writer::prop("state", state) >> inst;
        }
    protected:
        int model_;
        int executable_;
        std::string resolution_state_;
        std::vector<std::string> params_;
    };

} } }

#endif
