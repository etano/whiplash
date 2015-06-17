#ifndef WDB_ENTITIES_TSP_PROPERTY_HPP
#define WDB_ENTITIES_TSP_PROPERTY_HPP

namespace wdb { namespace entities { namespace tsp {

    class property : public wdb::entities::dynamic_generic::property {
    public:
        property(const odb::iobject& o)
            : wdb::entities::dynamic_generic::property(o)
        {}

        property(int model_id, int executable_id, const std::vector<std::string>& params, resolution_state state = resolution_state::NOTSTARTED)
            : wdb::entities::dynamic_generic::property(model_id, executable_id, params, state)
        {}

    };

} } }

#endif
