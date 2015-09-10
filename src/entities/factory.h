#ifndef WDB_ENTITIES_FACTORY_H
#define WDB_ENTITIES_FACTORY_H

namespace wdb { namespace entities {

    class model;
    class property;
    class executable;
    class controller;

    enum class etype { model,
                       property,
                       executable,
                       controller };

    enum class ptype {
        ising,
        tsp,
        xx,
        sat,
        LENGTH // 4
    };

    template<ptype Problem>
    struct info {};

    class factory {
        factory(const factory&) = delete;
        factory& operator=(const factory&) = delete;
        factory() = default;
    public:
        template<ptype T>
        struct associated_tuple {
            typedef std::tuple< typename info<(ptype)T>::associated_model_type,
                                typename info<(ptype)T>::associated_property_type,
                                typename info<(ptype)T>::associated_executable_type,
                                typename info<(ptype)T>::associated_controller_type > triplet;
        };

        struct generic_tuple {
            typedef std::tuple< entities::model,
                                entities::property,
                                entities::executable,
                                entities::controller > triplet;
        };

        template<etype E>
        using generic_entity = typename std::tuple_element<(int)E, typename generic_tuple::triplet >::type;

        template<etype E, ptype T, typename... Params>
        static std::shared_ptr< generic_entity<E> > make(Params&&... parameters);

        template<etype E, typename... Params>
        static std::shared_ptr< generic_entity<E> > make(std::string class_name, Params&&... parameters);

        template<etype E>
        static std::shared_ptr< generic_entity<E> > make(odb::iobject& o);

        template<etype E>
        static std::shared_ptr< generic_entity<E> > make(int id);

        template<etype E>
        static void init(odb::icollection& c);

        static std::unordered_map<std::string, ptype> lookup_table;
    private:
        std::vector<odb::icollection*> collections;
        template<class T> struct weak_instance {
            static factory w;
        };
    };

    template<class T>
    factory factory::weak_instance<T>::w;

    using reader = wdb::odb::mongo::prop_reader;
    using writer = wdb::odb::mongo::prop_writer;

} }

#endif
