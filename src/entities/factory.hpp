#ifndef WDB_ENTITIES_FACTORY_HPP
#define WDB_ENTITIES_FACTORY_HPP

#define CASE_UNROLL CASE(1) CASE(2) CASE(3) CASE(4)
#define LIST_UNROLL CASE(1),CASE(2),CASE(3),CASE(4)
// TODO: make templated repeat instead (ptype::LENGTH)

namespace wdb { namespace entities {

    template<ptype T>
    struct associated_tuple {
        typedef std::tuple< typename info<(ptype)T>::associated_model_type,
                            typename info<(ptype)T>::associated_property_type,
                            typename info<(ptype)T>::associated_controller_type > triplet;
    };

    struct generic_tuple {
        typedef std::tuple< entities::model,
                            entities::property,
                            entities::controller > triplet;
    };

    class factory {
    public:
        template<etype E, ptype T>
        using concrete_entity = typename std::tuple_element<(int)E, typename associated_tuple<T>::triplet >::type;

        template<etype E>
        using generic_entity = typename std::tuple_element<(int)E, typename generic_tuple::triplet >::type;

        template<etype E, ptype T, typename... Params>
        static std::shared_ptr< generic_entity<E> > make_entity(Params&&... parameters){
            return std::shared_ptr< concrete_entity<E,T> >(new concrete_entity<E,T>(parameters...));
        }

        template<etype E, typename... Params>
        static std::shared_ptr< generic_entity<E> > make_entity(std::string class_name, Params&&... parameters) {
            switch(lookup_table[class_name]){
                #define CASE(N) case (ptype)N : return make_entity<E,(ptype)N>(parameters...);
                CASE_UNROLL
                #undef CASE
            }
            throw std::runtime_error("Unknown problem class");
        }

        template<etype E>
        static std::shared_ptr< generic_entity<E> > make_entity(odb::iobject& o){
            std::string model_class = reader::read<std::string>(o, "class");
            return make_entity<E>(model_class, o);
        }

        static std::unordered_map<std::string, ptype> lookup_table;
    };

    std::unordered_map<std::string, ptype> factory::lookup_table {
        #define CASE(N) { info<(ptype)N>::name, (ptype)N }
        LIST_UNROLL
        #undef CASE
    };

} }

#endif
