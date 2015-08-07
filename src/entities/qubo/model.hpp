#ifndef WDB_ENTITIES_QUBO_MODEL_HPP
#define WDB_ENTITIES_QUBO_MODEL_HPP

namespace wdb { namespace entities { namespace qubo {

    class model : public generic::model {
    public:
        model(std::ifstream& in, optional<int> parent, const optional<dictionary>& params)
            : generic::model(typename entities::info<ptype::qubo>(), in, parent, params)
        {}

        model(const odb::iobject& o)
            : generic::model(o)
        {}

        virtual ~model() override {};
    };

} } }

#endif
