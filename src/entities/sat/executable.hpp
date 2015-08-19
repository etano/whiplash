#ifndef WDB_ENTITIES_SAT_EXECUTABLE_HPP
#define WDB_ENTITIES_SAT_EXECUTABLE_HPP

namespace wdb { namespace entities { namespace sat {

    class executable : public entities::executable {
    public:
        executable(std::string path, std::string desc, std::string algo, std::string version, std::string build_info, optional<parameters> params)
            : entities::executable(typename entities::info<ptype::sat>(), path, desc, algo, version, build_info, params)
        {}

        executable(const odb::iobject& o)
            : entities::executable(o)
        {}

        virtual ~executable() override {};
    };

} } }

#endif
