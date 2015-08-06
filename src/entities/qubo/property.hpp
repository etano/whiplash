#ifndef WDB_ENTITIES_QUBO_PROPERTY_HPP
#define WDB_ENTITIES_QUBO_PROPERTY_HPP

namespace wdb { namespace entities { namespace qubo {

    class property : public generic::property {
    public:
        property(const odb::iobject& o)
            : generic::property(o)
        {}

        property(int model_id, int executable_id, const dictionary& params, int seed, status s = status::UNDEFINED)
            : generic::property(typename entities::info<ptype::qubo>(), model_id, executable_id, params, seed, s)
        {}

        virtual ~property() override {};
    };

} } }

#endif
