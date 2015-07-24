#ifndef WDB_ENTITIES_GENERIC_PROPERTY_HPP
#define WDB_ENTITIES_GENERIC_PROPERTY_HPP

namespace wdb { namespace entities { namespace generic {

    class property {
    public:
        enum class status { UNDEFINED, PROCESSING, DEFINED };

        property(const odb::iobject& o){
            class_ = reader::read<std::string>(o, "class");
            model_ = reader::read<int>(o, "model_id");
            executable_ = reader::read<int>(o, "executable_id");
            status_ = static_cast<status>(reader::read<int>(o, "status"));
            for(auto e : reader::read<reader::array_type>(o, "params"))
                params_.push_back(reader::read<std::string>(e));
        }

        void print_params(){
            for (auto p : params_)
                std::cout << p << std::endl;
        }

        void info(){
            std::cout << "Class: " << class_ << "\n";
            std::cout << "Model: " << model_ << "\n";
            std::cout << "Executable: " << executable_ << "\n";
            std::cout << "Resolution status: " << int(status_) << "\n";
            std::cout << "Params: "; for(auto e : params_) std::cout << e << " ";
            std::cout << "\n";
        }

        template<int N>
        std::string param(){
            return params_[N];
        }

        template<class I>
        property(I info, int model_id, int executable_id, const std::vector<std::string>& params, status s = status::UNDEFINED)
            : class_(I::name), model_(model_id), executable_(executable_id), params_(params), status_(s)
        {}

        virtual ~property() {};

        virtual void serialize_configuration(odb::iobject& configuration) {}

        void serialize(odb::iobject& record, const odb::iobject& configuration){
            writer::prop("class", class_) >> record;
            writer::prop("model_id", model_) >> record;
            writer::prop("executable_id", executable_) >> record;
            writer::prop("status", int(status_)) >> record;
            writer::prop("params", params_) >> record;
            writer::prop("configuration", configuration) >> record;
        }

        std::string get_class() { return class_; }
        int get_model() { return model_; }
        int get_executable() { return executable_; }
        status get_status() { return status_; }
        bool is_defined(){ return status_ == status::DEFINED; }
        std::vector<std::string> get_params() { return params_; }
        void set_status(status s) { status_ = s; }
    protected:
        int model_;
        int executable_;
        std::string class_;
        status status_;
        std::vector<std::string> params_;
    };

} } }

#endif
