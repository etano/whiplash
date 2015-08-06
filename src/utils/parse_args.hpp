#ifndef WDB_UTILS_PARAMS_HPP
#define WDB_UTILS_PARAMS_HPP


namespace std {
    std::string to_string(std::string& val){ return val; }
}

namespace wdb { namespace utils {

    template <class T>
    T str_to_val(const std::string& val) { return val; }
    template <>
    std::string str_to_val(const std::string& val) { return val; }
    template <>
    double str_to_val(const std::string& val) { return stod(val); }
    template <>
    float str_to_val(const std::string& val) { return stof(val); }
    template <>
    int str_to_val(const std::string& val) { return stoi(val); }
    template <>
    unsigned int str_to_val(const std::string& val) { return stoi(val); }
    template <>
    bool str_to_val(const std::string& val) { return stoi(val); }

} }

namespace wdb {

    class params_type {
    public:
        params_type() {}

        params_type(int argc, char *argv[]){
            bool have_key = false;
            std::string key;
            for(int i = 1; i < argc; ++i){
                if(argv[i][0] == '-'){
                    if(!have_key) have_key = true;
                    key = argv[i] + 1;
                }else if(have_key){
                    params_[key] = std::string(argv[i]);
                    have_key = false;
                }
            }
        }

        params_type(const std::unordered_map<std::string,std::string>& params)
          : params_(params)
        {}

        params_type & operator= (const std::unordered_map<std::string,std::string>& params){
            params_ = params;
        }

        // Required
        template<typename T>
        T get(const std::string& key){
            auto iterator = params_.find(key);
            if(iterator == params_.end()){
                std::cerr << "ERROR: " << key << " not found!" << std::endl;
                exit(1);
            }
            return convert<T>::str_to_val(iterator->second);
        }

        template<typename T>
        T pop(const std::string& key){
            T val(get<T>(key));
            params_.erase(key);
            return val;
        }

        // Optional
        template<typename T>
        T get(const std::string& key, const T& default_val){
            auto iterator = params_.find(key);
            if(iterator == params_.end()){
                params_[key] = default_val;
                return default_val;
            }
            return convert<T>::str_to_val(iterator->second);
        }

        template<typename T>
        T pop(const std::string& key, const T& default_val){
            T val = get<T>(key,default_val);
            params_.erase(key);
            return val;
        }

        template<typename T>
        void set(const std::string& key, const T& val) { params_[key] = std::to_string(val); }

        const std::unordered_map<std::string,std::string>& get_params() const { return params_; }

        // TODO: make an iterator

    private:
        // Specializations
        template<class T>
        struct convert{
            static T str_to_val(const std::string& val) { return utils::str_to_val<T>(val); }
        };
        template<class T>
        struct convert<std::vector<T>>{
            static std::vector<T> str_to_val(const std::string& vals) {
                std::istringstream val_ss(vals);
                std::string val_s;
                std::vector<int> val;
                while (getline(val_ss,val_s,','))
                    val.push_back(utils::str_to_val<T>(val_s));
                return val;
            }
        };

        std::unordered_map<std::string,std::string> params_;
    };

}

#endif
