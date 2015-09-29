#ifndef WDB_ENTITIES_GENERIC_PROPERTY_HPP
#define WDB_ENTITIES_GENERIC_PROPERTY_HPP

namespace wdb { namespace entities {

    class property : public wdb::rte::icacheable {
    public:
        enum class status { UNDEFINED, PULLED, PROCESSING, DEFINED };

        property(const odb::iobject& o){
            class_ = reader::read<std::string>(o, "class");
            model_ = reader::read<int>(o, "model_id");
            executable_ = reader::read<int>(o, "executable_id");
            status_ = (optional<status>)reader::read<int>(o, "status");
            walltime_ = reader::read<double>(o, "walltime");
            seed_ = reader::read<int>(o, "seed");
            params_ = reader::read<parameters>(o, "params");
        }

        void print_params(){
            if (params_)
                if (params_.unwrap().get_container())
                    for(auto& p : params_.unwrap().get_container().unwrap())
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
            if (params_)
                if (params_.unwrap().get_container())
                    return params_.unwrap().get<T>(key);
            return optional<T>();
        }

        template<class T>
        void set_param(std::string key, const T& value){
            if (!params_)
                params_ = optional<parameters>(parameters::container_type());
            params_.unwrap().set<T>(key, value);
        }

        template<class T>
        optional_expr<T> optional_set_param(std::string key, const T& default_value){
           return [this,key,default_value](){
               this->set_param(key, default_value); return default_value;
           };
        }

        template<class I>
        property(I info, int model_id, int executable_id, optional<parameters> params, int seed, status s = status::UNDEFINED, double t = -1)
            : class_(I::name), model_(model_id), executable_(executable_id), params_(params), seed_(seed), status_(s), walltime_(t)
        {}

        virtual ~property(){};

        virtual void serialize_cfg(odb::iobject& cfg) {};

        void serialize(odb::iobject& record, odb::iobject& cfg){
            writer::prop("class", class_) >> record;
            writer::prop("model_id", model_) >> record;
            writer::prop("executable_id", executable_) >> record;
            writer::prop("status", int(status_)) >> record;
            writer::prop("walltime", walltime_) >> record;
            writer::prop("seed", int(seed_)) >> record;
            if (params_)
                if (params_.unwrap().get_container())
                    writer::prop("params", params_) >> record;
            writer::prop("cfg", cfg) >> record;
        }

        std::string get_class(){ return class_; }
        int get_model(){ return model_; }
        int get_executable(){ return executable_; }
        status get_status(){ return status_; }
        double get_walltime(){ return walltime_; }
        int get_seed(){ return seed_; }
        bool is_defined(){ return status_ == status::DEFINED; }
        bool is_pulled(){ return status_ == status::PULLED; }
        bool is_processing(){ return status_ == status::PROCESSING; }
        bool is_undefined(){ return status_ == status::UNDEFINED; }
        static bool is_undefined(const odb::iobject& o){
            return status::UNDEFINED == (optional<status>)reader::read<int>(o, "status");
        }
        optional<parameters>& get_params(){ return params_; }
        void set_status(status s){ status_ = s; }
        void set_walltime(double t){ walltime_ = t; }
    protected:
        int model_;
        int executable_;
        std::string class_;
        status status_;
        double walltime_;
        int seed_;
        optional<parameters> params_;
    };

} }

#endif
