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
    }

    class prop_reader {
    public:
        typedef detail::object_view object_view;
        typedef detail::element prop_type;
        typedef detail::array_view array_type;
        typedef int int_type;

        static array_type Array(const iobject& obj, const std::string& name0, const std::string& name1){
            const auto& m_obj = static_cast<const odb::mongo::object&>(obj);
            return std::move(detail::get<array_type>(detail::get<object_view>(m_obj.r.view, name0), name1));
        }
        static array_type Array(const iobject& obj, std::string name){
            const auto& m_obj = static_cast<const odb::mongo::object&>(obj);
            return detail::get<array_type>(m_obj.r.view, name);
        }
        static array_type Array(prop_type e){
            return detail::get<array_type>(e);
        }

        static int_type Int(const iobject& obj, std::string name){
            const auto& m_obj = static_cast<const odb::mongo::object&>(obj);
            return detail::get<int_type>(m_obj.r.view, name);
        }
        static int_type Int(prop_type e){
            return detail::get<int_type>(e);
        }

        static double Double(const iobject& obj, std::string name){
            const auto& m_obj = static_cast<const odb::mongo::object&>(obj);
            return detail::get<double>(m_obj.r.view, name);
        }
        static double Double(prop_type e){
            return detail::get<double>(e);
        }

        static std::string String(const iobject& obj, std::string name){
            const auto& m_obj = static_cast<const odb::mongo::object&>(obj);
            return detail::get<std::string>(m_obj.r.view, name);
        }
        static std::string String(prop_type e){
            return detail::get<std::string>(e);
        }
    };

} } }

#endif
