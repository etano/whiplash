#ifndef WDB_ENTITIES_DYNAMIC_GENERIC_PROPERTY_HPP
#define WDB_ENTITIES_DYNAMIC_GENERIC_PROPERTY_HPP

namespace wdb { namespace entities { namespace dynamic_generic {

    class property : public wdb::entities::generic::property {
    public:
        property(const odb::iobject& o) : wdb::entities::generic::property(o) {}
        property(int model_id, int executable_id, const std::vector<std::string>& params)
            : wdb::entities::generic::property(model_id, executable_id, params)
        {}

        virtual void serialize_state(odb::iobject& state) {}
    };

} } }

#endif
