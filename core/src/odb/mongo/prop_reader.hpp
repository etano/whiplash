#ifndef WDB_ODB_MONGO_PROP_READER_HPP
#define WDB_ODB_MONGO_PROP_READER_HPP

#include "../../utils/index_tuple.h"

namespace wdb { namespace odb { namespace mongo {

    namespace detail {
        using object_view = bsoncxx::v0::document::view;
        using array_view = bsoncxx::v0::array::view;
        using element = bsoncxx::v0::array::element;

        template<typename T>
        T get(object_view doc, std::string field){
            printf("Error: unknown type for %s \n", field.c_str());
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
        int64_t get<int64_t>(object_view doc, std::string field){
            return (int64_t)doc[field].get_int64();
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

        template<>
        std::unordered_map<std::string,std::string> get<std::unordered_map<std::string,std::string>>(object_view doc, std::string field){
            std::unordered_map<std::string,std::string> umap;
            auto o = get<object_view>(doc,field);
            for (auto& p : o) {
                if (p) {
                    std::string key(p.key());
                    umap[key] = get<std::string>(o, key);
                }
            }
            return umap;
        }

        template<>
        parameters get<parameters>(object_view doc, std::string field){
            return get<parameters::container_type>(doc,field);
        }

        template<typename T>
        optional<T> checked_get(object_view doc, std::string field){
            if(doc.find(field) == doc.end()){
                std::cerr << "WARNING: " << field << " not defined." << std::endl;
                return optional<T>();
            }
            return get<T>(doc, field);
        }

        template<typename T>
        T get(element e){
            printf("Error: unknown type\n");
        }

        template<>
        int get<int>(element e){
            try{ // FIXME: HACK, and probably not OK!
                return (int)e.get_int32();
            }catch(std::exception& exc){
                return (int)e.get_int64();
            }
        }

        template<>
        int64_t get<int64_t>(element e){
            try{ // FIXME: HACK, but probably OK!
                return (int64_t)e.get_int64();
            }catch(std::exception& exc){
                return (int64_t)e.get_int32();
            }
        }

        template<>
        double get<double>(element e){
            try{ // FIXME: HACK, but probably OK!
                return (double)e.get_double();
            }catch(std::exception& exc){
                return get<int64_t>(e);
            }
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
            return detail::checked_get<T>(v, std::get<I>(args));
        }

        template<typename T, typename... Args, unsigned I0, unsigned I1, unsigned... Is>
        static optional<T> read(const object_view& v, const std::tuple<Args...>& args, redi::index_tuple<I0, I1, Is...>){
            return read<T>( detail::checked_get<object_view>(v, std::get<I0>(args)), args, redi::index_tuple<I1, Is...>() );
        }

        template<typename T, typename... Args>
        static optional<T> read(const iobject& obj, const std::tuple<Args...>& args){
            const auto& m_obj = static_cast<const odb::mongo::object&>(obj);
            return read<T>(m_obj.r.view, args, redi::to_index_tuple<Args...>());
        }

        template<typename T>
        static optional<T> read(const object_view& v, std::vector<std::string> args){
            args.erase(args.begin());
            if (args.size() == 1)
                return detail::checked_get<T>(v, args[0]);
            else
                return read<T>( detail::checked_get<object_view>(v, args[0]), args );
        }

        template<typename T>
        static optional<T> read(const iobject& obj, std::vector<std::string> args){
            const auto& m_obj = static_cast<const odb::mongo::object&>(obj);
            if(args.size() == 1)
                return detail::checked_get<T>(m_obj.r.view, args[0]);
            else
                return read<T>( detail::checked_get<object_view>(m_obj.r.view, args[0]), args );
        }

        template<typename T, typename... Args>
        static optional<T> read(const iobject& obj, const Args&... args){
            return read<T>(obj, std::tie(args...));
        }

        template<typename T>
        static T read(prop_type e){
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

std::ostream& operator<<(std::ostream& os, wdb::odb::iobject& ss){
    return os << wdb::odb::mongo::prop_reader::to_json(ss);
}

#endif