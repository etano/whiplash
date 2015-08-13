#ifndef WDB_ENTITIES_SAT_PROPERTY_HPP
#define WDB_ENTITIES_SAT_PROPERTY_HPP

namespace wdb { namespace entities { namespace sat {

    class property : public entities::property {
    public:
        property(const odb::iobject& o)
            : entities::property(o)
        {}

        property(int model_id, int executable_id, optional<parameters> params, int seed, status s = status::UNDEFINED)
            : entities::property(typename entities::info<ptype::sat>(), model_id, executable_id, params, seed, s)
        {}

        virtual ~property() override {};
    };

} } }

#endif
