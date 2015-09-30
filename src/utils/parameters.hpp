#ifndef WDB_UTILS_PARAMETERS_HPP
#define WDB_UTILS_PARAMETERS_HPP

#include <unordered_map>
#include <string>

namespace std {
    std::string to_string(const std::string& val){ return val; }
}

namespace wdb { namespace utils {

    bool is_numeric(const std::string& val) {
        return std::all_of(val.begin(), val.end(), ::isdigit);
    }

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
    bool str_to_val(const std::string& val) { return stoi(val); }
    template <>
    uint64_t str_to_val(const std::string& val) { return stoi(val); }
    template <>
    uint32_t str_to_val(const std::string& val) { return stoi(val); }

} }

namespace wdb {

    class parameters {
    public:
        typedef std::unordered_map<std::string,std::string> container_type;
        parameters(int argc, char *argv[]) {
            bool have_key = false;
            std::string key;
            for(int i = 1; i < argc; ++i){
                if(argv[i][0] == '-' && !have_key){
                    have_key = true;
                    key = argv[i] + 1;
                }else if(have_key){
                    this->c_[key] = std::string(argv[i]);
                    have_key = false;
                }
            }
        }

        parameters(){}

        parameters(const container_type& c)
          : c_(c)
        {}

        template<typename T>
        optional<T> get(const std::string& key) const {
            auto iterator = c_.find(key);
            if(iterator == c_.end()){
                std::cerr << "WARNING: " << key << " not defined." << std::endl;
                return optional<T>();
            }
            return convert<T>::str_to_val(iterator->second);
        }

        template<typename T>
        void set(const std::string& key, const T& val){
            c_[key] = std::to_string(val);
        }

        optional<container_type> get_container() const {
            if (c_.empty()) return optional<container_type>();
            return c_;
        }

        template<typename T>
        optional<T> pop(const std::string& key){
            optional<T> val = get<T>(key);
            if(val) this->c_.erase(key);
            return val;
        }
     private:
        // Specializations // why here?
        template<class T>
        struct convert{
            static T str_to_val(const std::string& val) { return utils::str_to_val<T>(val); }
        };
        template<class T>
        struct convert<std::vector<T>>{
            static std::vector<T> str_to_val(const std::string& vals) {
                std::istringstream val_ss(vals);
                std::string val_s;
                std::vector<T> val;
                while (getline(val_ss,val_s,','))
                    val.push_back(utils::str_to_val<T>(val_s));
                return val;
            }
        };
        container_type c_;
    };

}

#endif
