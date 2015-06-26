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


        template<typename T>
        static array_type Array(const object_view& v, const T& name){
            return detail::get<array_type>(v, name);
        }
        template<typename T, typename... Args>
        static array_type Array(const object_view& v, const T& name, const Args&... args){
            return Array( detail::get<object_view>(v, name), args... );
        }
        template<typename... Args>
        static array_type Array(const iobject& obj, const Args&... args){
            const auto& m_obj = static_cast<const odb::mongo::object&>(obj);
            return Array(m_obj.r.view, args...);
        }
        static array_type Array(prop_type e){
            return detail::get<array_type>(e);
        }

        template<typename T>
        static int_type Int(const object_view& v, const T& name){
            return detail::get<int_type>(v, name);
        }
        template<typename T, typename... Args>
        static int_type Int(const object_view& v, const T& name, const Args&... args){
            return Int( detail::get<object_view>(v, name), args... );
        }
        template<typename... Args>
        static int_type Int(const iobject& obj, const Args&... args){
            const auto& m_obj = static_cast<const odb::mongo::object&>(obj);
            return Int(m_obj.r.view, args...);
        }
        static int_type Int(prop_type e){
            return detail::get<int_type>(e);
        }

        template<typename T>
        static double Double(const object_view& v, const T& name){
            return detail::get<double>(v, name);
        }
        template<typename T, typename... Args>
        static double Double(const object_view& v, const T& name, const Args&... args){
            return Double( detail::get<object_view>(v, name), args... );
        }
        template<typename... Args>
        static double Double(const iobject& obj, const Args&... args){
            const auto& m_obj = static_cast<const odb::mongo::object&>(obj);
            return Double(m_obj.r.view, args...);
        }
        static double Double(prop_type e){
            return detail::get<double>(e);
        }

        template<typename T>
        static std::string String(const object_view& v, const T& name){
            return detail::get<std::string>(v, name);
        }
        template<typename T, typename... Args>
        static std::string String(const object_view& v, const T& name, const Args&... args){
            return String( detail::get<object_view>(v, name), args... );
        }
        template<typename... Args>
        static std::string String(const iobject& obj, const Args&... args){
            const auto& m_obj = static_cast<const odb::mongo::object&>(obj);
            return String(m_obj.r.view, args...);
        }
        static std::string String(prop_type e){
            return detail::get<std::string>(e);
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
