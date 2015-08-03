#ifndef WDB_ENTITIES_GENERIC_PROPERTY_HPP
#define WDB_ENTITIES_GENERIC_PROPERTY_HPP

namespace wdb { namespace entities { namespace generic {

    template <class T>
    T str_to_val(std::string& val) { return val; }
    template <>
    std::string str_to_val(std::string& val) { return val; }
    template <>
    double str_to_val(std::string& val) { return stod(val); }
    template <>
    float str_to_val(std::string& val) { return stof(val); }
    template <>
    int str_to_val(std::string& val) { return stoi(val); }
    template <>
    unsigned int str_to_val(std::string& val) { return stoi(val); }
    template <>
    bool str_to_val(std::string& val) { return stoi(val); }

    template <class T>
    std::string val_to_str(T& val) { return std::to_string(val); }
    template <>
    std::string val_to_str(std::string& val) { return val; }


    class property {
    public:
        enum class status { UNDEFINED, PROCESSING, DEFINED };

        property(const odb::iobject& o){
            class_ = reader::read<std::string>(o, "class");
            model_ = reader::read<int>(o, "model_id");
            executable_ = reader::read<int>(o, "executable_id");
            status_ = static_cast<status>(reader::read<int>(o, "status"));
            walltime_ = reader::read<double>(o, "walltime");
            seed_ = reader::read<int>(o, "seed");
            params_ = reader::read<std::unordered_map<std::string,std::string>>(o, "params");
        }

        void print_params(){
            for(auto p : params_)
                std::cout << p.first << " : " << p.second << std::endl;
        }

        void info(){
            std::cout << "Class: " << class_ << "\n";
            std::cout << "Model: " << model_ << "\n";
            std::cout << "Executable: " << executable_ << "\n";
            std::cout << "Status: " << int(status_) << "\n";
            std::cout << "Walltime: " << walltime_ << "\n";
            std::cout << "Seed: " << seed_ << "\n";
            std::cout << "Params: "; print_params();
            std::cout << "\n";
        }

        template<class T>
        optional<T> get_param(std::string key){
            return str_to_val<T>(params_[key]);
        }

        template<class T>
        optional<T> set_param(std::string key, T value){
            params_[key] = val_to_str(value);
            return value;
        }

        template<class I>
        property(I info, int model_id, int executable_id, const std::unordered_map<std::string,std::string>& params, int seed, status s = status::UNDEFINED, double t = -1)
            : class_(I::name), model_(model_id), executable_(executable_id), params_(params), seed_(seed), status_(s), walltime_(t)
        {}

        virtual ~property(){};

        virtual void serialize_cfg(odb::iobject& cfg) {};

        void serialize(odb::iobject& record, const odb::iobject& cfg){
            odb::mongo::object params_object;
            for(auto &p : params_)
                writer::prop(p.first, p.second) >> params_object;
            writer::prop("params", params_object) >> record;
            writer::prop("class", class_) >> record;
            writer::prop("model_id", model_) >> record;
            writer::prop("executable_id", executable_) >> record;
            writer::prop("status", int(status_)) >> record;
            writer::prop("walltime", walltime_) >> record;
            writer::prop("seed", int(seed_)) >> record;
            writer::prop("cfg", cfg) >> record;
        }

        std::string get_class(){ return class_; }
        int get_model(){ return model_; }
        int get_executable(){ return executable_; }
        status get_status(){ return status_; }
        double get_walltime(){ return walltime_; }
        int get_seed(){ return seed_; }
        bool is_defined(){ return status_ == status::DEFINED; }
        std::unordered_map<std::string,std::string>& get_params(){ return params_; }
        void set_status(status s){ status_ = s; }
        void set_walltime(double t){ walltime_ = t; }
    protected:
        int model_;
        int executable_;
        std::string class_;
        status status_;
        double walltime_;
        std::unordered_map<std::string,std::string> params_;
        int seed_;
    };

} } }

#endif
