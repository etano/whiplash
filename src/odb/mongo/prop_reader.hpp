#ifndef WDB_ODB_MONGO_PROP_READER_HPP
#define WDB_ODB_MONGO_PROP_READER_HPP

#include "utils/index_tuple.h"

namespace wdb { namespace odb { namespace mongo {

    namespace detail {
        using object_view = bsoncxx::v0::document::view;
        using array_view = bsoncxx::v0::array::view;
        using element = bsoncxx::v0::array::element;

        template<typename T>
        T get_sp(object_view doc, std::string field){
            printf("Error: unknown type for %s \n", field.c_str());
        }

        template<>
        double get_sp<double>(object_view doc, std::string field){
            return (double)doc[field].get_double();
        }

        template<>
        int get_sp<int>(object_view doc, std::string field){
            return (int)doc[field].get_int32();
        }

        template<>
        int64_t get_sp<int64_t>(object_view doc, std::string field){
            return (int64_t)doc[field].get_int64();
        }

        template<>
        std::string get_sp<std::string>(object_view doc, std::string field){
            return (std::string)doc[field].get_utf8().value;
        }

        template<>
        array_view get_sp<array_view>(object_view doc, std::string field){
            return (array_view)doc[field].get_array();
        }

        template<>
        object_view get_sp<object_view>(object_view doc, std::string field){
            return (object_view)doc[field].get_document();
        }

        template<>
        std::unordered_map<std::string,std::string> get_sp<std::unordered_map<std::string,std::string>>(object_view doc, std::string field){
            std::unordered_map<std::string,std::string> umap;
            auto o = get_sp<object_view>(doc,field);
            for (auto& p : o) {
                if (p) {
                    std::string key(p.key());
                    umap[key] = get_sp<std::string>(o, key);
                }
            }
            return umap;
        }

        template<>
        dictionary get_sp<dictionary>(object_view doc, std::string field){
            return get_sp<dictionary::container_type>(doc,field);
        }

        template<typename T>
        optional<T> get(object_view doc, std::string field){
            if (doc.find(field) == doc.end()) return optional<T>();
            return optional<T>(get_sp<T>(doc, field));
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
        int64_t get<int64_t>(element e){
            return (int64_t)e.get_int64();
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

        template<typename T, typename... Args, unsigned I>
        static optional<T> read(const object_view& v, const std::tuple<Args...>& args, redi::index_tuple<I>){
            return detail::get<T>(v, std::get<I>(args));
        }

        template<typename T, typename... Args, unsigned I, unsigned... Is>
        static optional<T> read(const object_view& v, const std::tuple<Args...>& args, redi::index_tuple<I, Is...>){
            return read<T>( detail::get<object_view>(v, std::get<I>(args)), args, redi::index_tuple<Is...>() );
        }

        template<typename T, typename... Args>
        static optional<T> read(const iobject& obj, const std::tuple<Args...>& args){
            const auto& m_obj = static_cast<const odb::mongo::object&>(obj);
            return read<T>(m_obj.r.view, args, redi::to_index_tuple<Args...>());
        }

        template<typename T, typename... Args>
        static optional<T> read(const iobject& obj, const Args&... args){
            return read<T>(obj, std::tie(args...));
        }

        template<typename T>
        static optional<T> read(prop_type e){
            return detail::get<T>(e);
        }

        static std::string to_json(const iobject& obj){
            const auto& m_obj = static_cast<const odb::mongo::object&>(obj);
            return detail::to_json(m_obj.r.view);
        }

        static std::string to_json(const object_view& obj_v){
            return detail::to_json(obj_v);
        }

    };

} } }

std::ostream &operator<<(std::ostream &os, wdb::odb::iobject& ss){
    return os << wdb::odb::mongo::prop_reader::to_json(ss);
}

#endif
