#ifndef WDB_ENTITIES_GENERIC_PROPERTY_HPP
#define WDB_ENTITIES_GENERIC_PROPERTY_HPP

namespace wdb { namespace entities { namespace generic {

    class property {
    public:
        enum class resolution_state { UNDEFINED, PROCESSING, DEFINED };

        property(const odb::iobject& o){
            class_ = reader::String(o, "class");
            model_ = reader::Int(o, "model_id");
            executable_ = reader::Int(o, "executable_id");
            state_ = static_cast<resolution_state>(reader::Int(o, "resolution_state"));
            for(auto e : reader::Array(o, "params"))
                params_.push_back(reader::String(e));
        }

        void print_params(){
            for (auto p : params_)
                std::cout << p << std::endl;
        }

        void info(){
            std::cout << "Class: " << class_ << "\n";
            std::cout << "Model: " << model_ << "\n";
            std::cout << "Executable: " << executable_ << "\n";
            std::cout << "Resolution state: " << int(state_) << "\n";
            std::cout << "Params: "; for(auto e : params_) std::cout << e << " ";
            std::cout << "\n";
        }

        template<int N>
        std::string param(){
            return params_[N];
        }

        template<class I>
        property(I info, int model_id, int executable_id, const std::vector<std::string>& params, resolution_state state = resolution_state::UNDEFINED)
            : class_(I::name), model_(model_id), executable_(executable_id), params_(params), state_(state)
        {}

        virtual ~property() {};

        virtual void serialize_configuration(odb::iobject& configuration) {}

        void serialize(odb::iobject& record, const odb::iobject& configuration){
            writer::prop("class", class_) >> record;
            writer::prop("model_id", model_) >> record;
            writer::prop("executable_id", executable_) >> record;
            writer::prop("resolution_state", int(state_)) >> record;
            writer::prop("params", params_) >> record;
            writer::prop("configuration", configuration) >> record;
        }

        std::string get_class() { return class_; }
        int get_model() { return model_; }
        int get_executable() { return executable_; }
        resolution_state get_resolution_state() { return state_; }
        bool is_defined(){ return state_ == resolution_state::DEFINED; }
        std::vector<std::string> get_params() { return params_; }
        void set_state(resolution_state state) { state_ = state; }
    protected:
        int model_;
        int executable_;
        std::string class_;
        resolution_state state_;
        std::vector<std::string> params_;
    };

} } }

#endif
