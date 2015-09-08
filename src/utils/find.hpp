#ifndef WDB_UTILS_FIND_HPP
#define WDB_UTILS_FIND_HPP
#include <type_traits>
#include <tuple>

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

    template<typename T, unsigned I>
    constexpr int find_type_many(redi::index_tuple<I>){
         return -1;
    }

    template<typename T, unsigned I, unsigned... Is>
    constexpr int find_type_many(redi::index_tuple<I, Is...>){
         typedef typename wdb::entities::factory::associated_tuple< (wdb::entities::ptype)(sizeof...(Is)) >::triplet tuple_type;
         return (find_type<T,tuple_type>() != -1 ? find_type<T,tuple_type>() : find_type_many<T>(redi::index_tuple<Is...>()));
    }

    template<int Offset>
    struct checked_get { static constexpr int value = Offset; };

    template<>
    struct checked_get< -1 > { /* type not found */ };

    template<typename T>
    T& find(char** argv){
        return *(T*)argv[ checked_get< find_type_many<T>(
                              redi::make_index_tuple<(int)wdb::entities::ptype::LENGTH>::type()
                          ) >::value + 1 ];
    }
}

#endif
