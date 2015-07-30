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
            walltime_ = reader::read<double>(o, "walltime");
            seed_ = reader::read<int>(o, "seed");
            for(auto &p : reader::read<reader::object_view>(o, std::tie("cfg", "params"))) {
                std::string key(p.key());
                params_[key] = reader::read<std::string>(o, std::tie("cfg", "params", key));
            }
            //for(auto e : reader::read<reader::array_type>(o, std::make_tuple("cfg", "params")))
            //    params_.push_back(reader::read<std::string>(e));
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

        std::string param(std::string key){
            if (params_.find(key) != params_.end())
                return params_[key];
            else {
                std::cerr << "ERROR: key " << key << " does not exist in params!" << std::endl;
                return "";
            }
        }

        std::string param(std::string key, std::string s){
            if (params_.find(key) != params_.end())
                return params_[key];
            else {
                params_[key] = s;
                return s;
            }
        }

        template<class I>
        property(I info, int model_id, int executable_id, const std::unordered_map<std::string,std::string>& params, int seed, status s = status::UNDEFINED, double t = -1)
            : class_(I::name), model_(model_id), executable_(executable_id), params_(params), seed_(seed), status_(s), walltime_(t)
        {}

        virtual ~property(){};

        virtual void serialize_cfg(odb::iobject& cfg){
            odb::mongo::object params_object;
            for(auto &p : params_)
                writer::prop(p.first, p.second) >> params_object;
            writer::prop("params", params_object) >> cfg;
        }

        void serialize(odb::iobject& record, const odb::iobject& cfg){
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
