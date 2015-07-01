#ifndef WDB_ENTITIES_FACTORY_HPP
#define WDB_ENTITIES_FACTORY_HPP

#define CASE_UNROLL CASE(1) CASE(2) CASE(3) CASE(4)
#define LIST_UNROLL CASE(1),CASE(2),CASE(3),CASE(4)
// TODO: make templated repeat instead (type::LENGTH)

namespace wdb { namespace entities {

    class factory {
    public:

        template<type T, typename... Params>
        static std::shared_ptr<generic::model> make_model(Params&&... parameters){
            return std::shared_ptr<typename info<T>::associated_model_type>(new typename info<T>::associated_model_type(parameters...));
        }

        template<type T, typename... Params>
        static std::shared_ptr<generic::property> make_property(Params&&... parameters){
            return std::shared_ptr<typename info<T>::associated_property_type>(new typename info<T>::associated_property_type(parameters...));
        }

        template<typename... Params>
        static std::shared_ptr<generic::model> make_model(std::string class_name, Params&&... parameters) {
            switch(lookup_table[class_name]){
                #define CASE(N) case (type)N : return make_model<(type)N>(parameters...);
                CASE_UNROLL
                #undef CASE
            }
            throw std::runtime_error("Unknown problem class");
        }

        template<typename... Params>
        static std::shared_ptr<generic::property> make_property(std::string class_name, Params&&... parameters) {
            switch(lookup_table[class_name]){
                #define CASE(N) case (type)N : return make_property<(type)N>(parameters...);
                CASE_UNROLL
                #undef CASE
            }
            throw std::runtime_error("Unknown problem class");
        }

        static std::shared_ptr<generic::model> make_model(odb::iobject& o){
            std::string model_class = reader::read<std::string>(o, "class");
            return make_model(model_class, o);
        }

        static std::shared_ptr<generic::property> make_property(odb::iobject& o){
            std::string model_class = reader::read<std::string>(o, "class");
            return make_property(model_class, o);
        }

        static std::unordered_map<std::string, type> lookup_table;
    };

    std::unordered_map<std::string, type> factory::lookup_table {
        #define CASE(N) { info<(type)N>::name, (type)N }
        LIST_UNROLL
        #undef CASE
    };

} }

#endif
