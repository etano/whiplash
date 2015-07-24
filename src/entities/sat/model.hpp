#ifndef WDB_ENTITIES_SAT_MODEL_HPP
#define WDB_ENTITIES_SAT_MODEL_HPP

namespace wdb { namespace entities { namespace sat {

    class model : public generic::model {
    public:
        model(std::ifstream& in)
            : generic::model(typename entities::info<type::sat>(), in)
        {}

        model(const odb::iobject& o)
            : generic::model(o)
        {}

        virtual ~model() override {};
    };

} } }

#endif
