#ifndef WDB_ENTITIES_QUBO_MODEL_HPP
#define WDB_ENTITIES_QUBO_MODEL_HPP

namespace wdb { namespace entities { namespace qubo {

    class model : public generic::model {
    public:
        model(std::ifstream& in)
            : generic::model(typename entities::info<type::qubo>(), in)
        {}

        model(const odb::iobject& o)
            : generic::model(o)
        {}

        virtual ~model() override {};
    };

} } }

#endif
