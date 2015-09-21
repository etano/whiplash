#ifndef WDB_ENTITIES_UEVOL_EXECUTABLE_HPP
#define WDB_ENTITIES_UEVOL_EXECUTABLE_HPP

#include <entities/generic/executable.hpp>
#include <string>
#include <utils/optional.hpp>

class parameters;

namespace wdb { namespace entities { namespace uevol {

    class executable : public entities::executable {
    public:
        executable( std::string path
                  , std::string desc
                  , std::string algo
                  , std::string version
                  , std::string build_info
                  , optional<parameters> params
                  )
            : entities::executable( typename entities::info<ptype::ising>(), path, desc, algo, version
                                  , build_info, params)
        {}

        executable(const odb::iobject& o)
            : entities::executable(o)
        {}

        virtual ~executable() override {}
    };

} } }

#endif // WDB_ENTITIES_UEVOL_EXECUTABLE_HPP
