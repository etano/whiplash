#ifndef WDB_UTILS_FIND_HPP
#define WDB_UTILS_FIND_HPP

#include <type_traits>
#include <tuple>

#include <bsoncxx/json.hpp>

namespace wdb {

    template<int N, int Limit>
    constexpr int lower_bound(){
        return (N > Limit ? N : Limit);
    }

    template<class T, class Tuple, int I = std::tuple_size<Tuple>::value>
    constexpr int find_type(){
        return I ? std::is_same< typename std::tuple_element<lower_bound<I-1,0>(),Tuple>::type, T >::value ? I-1 : find_type<T,Tuple,lower_bound<I-1,0>()>()
                 : -1;
    }

    template<typename T>
    constexpr int find_type_many(redi::index_tuple<>){
         return -1;
    }

    template<typename T, unsigned I, unsigned... Is>
    constexpr int find_type_many(redi::index_tuple<I, Is...>){
         typedef typename wdb::entities::factory::associated_tuple< (wdb::entities::ptype)(sizeof...(Is)) >::type tuple_type;
         return (find_type<T,tuple_type>() != -1 ? find_type<T,tuple_type>() : find_type_many<T>(redi::index_tuple<Is...>()));
    }

    template<int Offset>
    struct checked_get { static constexpr int value = Offset; };

    template<>
    struct checked_get< -1 > { /* type not found */ };

    template<typename T>
    T& find(int argc, char** argv){
        if(argc != -1){
            if(argc < 2) throw std::runtime_error("Please supply the input config.");
            auto& offline = entities::factory::weak_instance<void>::w.offline;
            if(!offline.active){
                std::ifstream in(argv[1]);
                std::string str((std::istreambuf_iterator<char>(in)),
                                 std::istreambuf_iterator<char>());
                in.close();
                
                auto value = bsoncxx::from_json(str);
                wdb::odb::mongo::object model_object(value->view()["model"].get_document());
                wdb::odb::mongo::object property_object(value->view()["property"].get_document());
                
                offline.model = entities::factory::make<entities::etype::model>(model_object);
                offline.property = entities::factory::make<entities::etype::property>(property_object);

                push<entities::model>(*offline.model, offline.argc, offline.argv);
                push<entities::property>(*offline.property, offline.argc, offline.argv);

                offline.active = true;
            }
            argv = offline.argv;
        }
         
        return *(T*)argv[ checked_get< find_type_many<T>(
                              redi::make_index_tuple<(int)wdb::entities::ptype::LENGTH>::type()
                          ) >::value + 1 ];
    }

    template<typename T>
    void push(T& obj, int& argc, char**& argv){
        int pos = checked_get< find_type<T,wdb::entities::factory::generic_tuple::type>() >::value + 1;
        if(pos >= argc){
            argc = pos+1;
            argv = (char**)realloc(argv, sizeof(char*)*argc);
        }
        argv[pos] = (char*)&obj;
    }
}

#endif
