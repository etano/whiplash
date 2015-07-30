#ifndef WDB_ENTITIES_SAT_PROPERTY_HPP
#define WDB_ENTITIES_SAT_PROPERTY_HPP

namespace wdb { namespace entities { namespace sat {

    class property : public generic::property {
    public:
        property(const odb::iobject& o)
            : generic::property(o)
        {}

        property(int model_id, int executable_id, const std::unordered_map<std::string,std::string>& params, int seed, status s = status::UNDEFINED)
            : generic::property(typename entities::info<ptype::sat>(), model_id, executable_id, params, seed, s)
        {}

        virtual ~property() override {};
    };

} } }

#endif
