#ifndef SIMFW_ODB_MONGO_PROP_READER_HPP
#define SIMFW_ODB_MONGO_PROP_READER_HPP

namespace simfw { namespace odb { namespace mongo {

    namespace detail {
        using object_view = bsoncxx::v0::document::view;
        using array_view = bsoncxx::v0::array::view;
        using element = bsoncxx::v0::array::element;

        template<typename T>
        T get(object_view doc, std::string field){
            printf("Error: unknown type\n");
        }

        template<>
        double get<double>(object_view doc, std::string field){
            return (double)doc[field].get_double();
        }

        template<>
        int get<int>(object_view doc, std::string field){
            return (int)doc[field].get_int32();
        }

        template<>
        array_view get<array_view>(object_view doc, std::string field){
            return (array_view)doc[field].get_array();
        }

        template<typename T>
        T get(element e){
            printf("Error: unknown type\n");
        }

        template<>
        int get<int>(element e){
            return (int)e.get_int32();
        }

        template<>
        double get<double>(element e){
            return (double)e.get_double();
        }

        template<>
        array_view get(element e){
            return (array_view)e.get_array();
        }
    }

    class prop_reader {
    public:
        typedef detail::element prop_type;
        typedef detail::array_view array_type;
        typedef int int_type;

        static array_type Array(const object& obj, std::string name){
            return detail::get<array_type>(obj.r.view, name);
        }

        static array_type Array(prop_type e){
            return detail::get<array_type>(e);
        }

        static int_type Int(prop_type e){
            return detail::get<int_type>(e);
        }

        static double Double(prop_type e){
            return detail::get<double>(e);
        }
    };

} } }

#endif

