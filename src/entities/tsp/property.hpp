#ifndef WDB_ENTITIES_TSP_PROPERTY_HPP
#define WDB_ENTITIES_TSP_PROPERTY_HPP

namespace wdb { namespace entities { namespace tsp {

    class property : public entities::property {
    public:
        property(const odb::iobject& o)
            : entities::property(o)
        {}

        property(int model_id, int executable_id, optional<parameters> params, int seed, status s = status::UNDEFINED)
            : entities::property(typename entities::info<ptype::tsp>(), model_id, executable_id, params, seed, s)
        {}

        virtual ~property() override {};
    };

} } }

#endif
