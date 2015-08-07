#ifndef WDB_ODB_MONGO_PROP_WRITER_HPP
#define WDB_ODB_MONGO_PROP_WRITER_HPP

namespace wdb { namespace odb { namespace mongo {

    class prop_writer {
    public:
        template<class T> using prop_type = std::tuple<std::string, T>;

        template<typename T>
        static T decompose(const T& t){
            return t;
        }
        template<typename T1, typename T2>
        static std::function<void(sub_array)> decompose(const std::pair<T1, T2>& t){
            return [&t](sub_array pair){
                pair.append(decompose(t.first));
                pair.append(decompose(t.second));
            };
        }
        template<typename T>
        static std::function<void(sub_document)> decompose(const std::unordered_map<std::string,T>& t){
            std::cout << "fdw" << std::endl;
           for(auto& e : t) {
               std::cout << e.first << " " << e.second << std::endl;
           }
            return [&t](sub_document doc){
                std::cout << "outside the lambda" << std::endl;
                for(auto i : t){
                  std::cout << "in the lambda" << std::endl;
                  std::cout << i.first << " " << i.second << std::endl;
                  doc.append(prop(i.first,i.second));
                }
            };
        }
        template<typename T>
        static std::function<void(sub_array)> decompose(const std::vector<T>& t){
            return [&t](sub_array array){
                for(auto i : t) array.append(decompose(i));
            };
        }
        static std::function<void(sub_array)> decompose(const std::vector<bool>& t){
            return [&t](sub_array array){
                for(auto i : t) array.append(int(i));
            };
        }

        static prop_type<int> prop(std::string name, int num){
            return bsoncxx::builder::basic::kvp(name, num);
        }
        static prop_type<double> prop(std::string name, double num){
            return bsoncxx::builder::basic::kvp(name, num);
        }
        static prop_type<std::string> prop(std::string name, std::string str){
            return bsoncxx::builder::basic::kvp(name, str);
        }
        template<typename T>
        static prop_type<std::function<void(sub_array)> > prop(std::string name, const std::vector<T>& vec){
            return bsoncxx::builder::basic::kvp(name, decompose(vec));
        }
        static prop_type<std::function<void(sub_document)> > prop(std::string name, const odb::iobject& obj){
            return bsoncxx::builder::basic::kvp(name, [&obj](sub_document o){
                bsoncxx::document::view view = static_cast<const odb::mongo::object&>(obj).w.builder.view();
                o._core->concatenate(view); // workaround (no means to call concatenate otherwise)
            });
        }
        static prop_type<std::function<void(sub_document)>> prop(std::string name, const std::unordered_map<std::string,std::string>& umap){
            if (umap.empty()){
                std::cerr << "ERROR: Attempting to write empty unordered map." << std::endl;
            }
            std::cout << "umap" << std::endl;
            return bsoncxx::builder::basic::kvp(name, decompose(umap));
        }
        static prop_type<std::function<void(sub_document)>> prop(std::string name, const parameters& params){
                if (params.get_container()){
                    for(auto& e : params.get_container().unwrap()) {
                        std::cout << "hi" << std::endl;
                        std::cout << e.first << " " << e.second << std::endl;
                    }
                }
                std::cout << "asdf" << std::endl;
            parameters::container_type c = params.get_container().unwrap();
                std::cout << "asdf" << std::endl;

            return prop(name, c);
        }
    };

} } }

template<typename U>
inline void operator>>(std::tuple<std::string, U> p, wdb::odb::iobject& ss){
    std::cout << "called operator" << std::endl;
    static_cast<wdb::odb::mongo::object&>(ss).w.builder.append( std::move(p) );
    std::cout << "asdfasdf" << std::endl;
}

#endif
