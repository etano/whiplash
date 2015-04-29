#ifndef SIMFW_ODB_MONGO_PROP_WRITER_HPP
#define SIMFW_ODB_MONGO_PROP_WRITER_HPP

namespace simfw { namespace odb { namespace mongo {

    class prop_writer {
    public:
        template<class T> using prop_type = std::tuple<std::string, T>;

        static prop_type<int> prop(std::string name, int num){
            return bsoncxx::builder::basic::kvp(name, num);
        }
        static prop_type<double> prop(std::string name, double num){
            return bsoncxx::builder::basic::kvp(name, num);
        }
        static prop_type<std::string> prop(std::string name, std::string str){
            return bsoncxx::builder::basic::kvp(name, str);
        }
        static prop_type<std::function<void(sub_document)> > prop(std::string name, const odb::iobject& obj){
            return bsoncxx::builder::basic::kvp(name, [&obj](sub_document o){
                o.append(kvp("config", [](sub_array subarr){ subarr.append(std::numeric_limits<double>::quiet_NaN()); })); // TODO: insert real stuff
                o.append(kvp("cost", std::numeric_limits<double>::quiet_NaN()));
            });
        }
        template<typename T>
        static prop_type<std::function<void(sub_array)> > prop(std::string name, std::vector<T> vec){
            return bsoncxx::builder::basic::kvp(name, [&vec](sub_array v){
                for(auto i : vec) v.append(i);
            });
        }
        static prop_type<std::function<void(sub_array)> > prop(std::string name, std::vector< std::pair<std::vector<int>, double > > vec){ // TODO
            return bsoncxx::builder::basic::kvp(name, [&vec](sub_array v){
                for(auto i : vec) v.append([&i](sub_array pair){
                    pair.append([&i](sub_array e){
                        for(int a : i.first) e.append(a);
                    });
                    pair.append(i.second);
                });
            });
        }
    };

} } }

namespace simfw {
    template<typename U>
    inline void operator>>(std::tuple<std::string, U> p, odb::iobject& ss){
        static_cast<odb::mongo::object&>(ss).w.builder.append( std::move(p) );
    }
}

#endif
