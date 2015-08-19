#ifndef WDB_ENTITIES_FACTORY_HPP
#define WDB_ENTITIES_FACTORY_HPP

#define CASE_UNROLL CASE(1) CASE(2) CASE(3) CASE(4)
#define LIST_UNROLL CASE(1),CASE(2),CASE(3),CASE(4)
// TODO: make templated repeat instead (ptype::LENGTH)

namespace wdb { namespace entities {

    template<etype E, ptype T, typename... Params>
    std::shared_ptr< factory::generic_entity<E> > factory::make_entity(Params&&... parameters){
        using concrete_entity = typename std::tuple_element<(int)E, typename factory::associated_tuple<T>::triplet >::type;
        return std::shared_ptr< concrete_entity >(new concrete_entity(parameters...));
    }

    template<etype E, typename... Params>
    std::shared_ptr< factory::generic_entity<E> > factory::make_entity(std::string class_name, Params&&... parameters) {
        switch(lookup_table[class_name]){
            #define CASE(N) case (ptype)N : return make_entity<E,(ptype)N>(parameters...);
            CASE_UNROLL
            #undef CASE
        }
        throw std::runtime_error("Unknown problem class");
    }

    template<etype E>
    std::shared_ptr< factory::generic_entity<E> > factory::make_entity(odb::iobject& o){
        std::string model_class = reader::read<std::string>(o, "class");
        return make_entity<E>(model_class, o);
    }

    std::unordered_map<std::string, ptype> factory::lookup_table {
        #define CASE(N) { info<(ptype)N>::name, (ptype)N }
        LIST_UNROLL
        #undef CASE
    };

} }

#endif
