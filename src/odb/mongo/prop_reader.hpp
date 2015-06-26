#ifndef WDB_ODB_MONGO_PROP_READER_HPP
#define WDB_ODB_MONGO_PROP_READER_HPP

namespace wdb { namespace odb { namespace mongo {

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
        std::string get<std::string>(object_view doc, std::string field){
            return (std::string)doc[field].get_utf8().value;
        }

        template<>
        array_view get<array_view>(object_view doc, std::string field){
            return (array_view)doc[field].get_array();
        }

        template<>
        object_view get<object_view>(object_view doc, std::string field){
            return (object_view)doc[field].get_document();
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
        std::string get<std::string>(element e){
            return (std::string)e.get_utf8().value;
        }

        template<>
        array_view get(element e){
            return (array_view)e.get_array();
        }

        std::string to_json(object_view doc){
            return bsoncxx::to_json(doc);
        }

    }

    class prop_reader {
    public:
        typedef detail::object_view object_view;
        typedef detail::element prop_type;
        typedef detail::array_view array_type;
        typedef int int_type;

        template<typename T, typename U>
        static T read(const object_view& v, const U& name){
            return detail::get<T>(v, name);
        }
        template<typename T, typename U, typename... Args>
        static T read(const object_view& v, const U& name, const Args&... args){
            return read<T>( detail::get<object_view>(v, name), args... );
        }
        template<typename T, typename... Args>
        static T read(const iobject& obj, const Args&... args){
            const auto& m_obj = static_cast<const odb::mongo::object&>(obj);
            return read<T>(m_obj.r.view, args...);
        }
        template<typename T>
        static T read(prop_type e){
            return detail::get<T>(e);
        }

        static std::string to_json(const iobject& obj){
            const auto& m_obj = static_cast<const odb::mongo::object&>(obj);
            return detail::to_json(m_obj.r.view);
        }

    };

} } }

std::ostream &operator<<(std::ostream &os, wdb::odb::iobject& ss){
    return os << wdb::odb::mongo::prop_reader::to_json(ss);
}

#endif
