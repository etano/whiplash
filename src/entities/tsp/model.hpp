#ifndef WDB_ENTITIES_TSP_MODEL_HPP
#define WDB_ENTITIES_TSP_MODEL_HPP

namespace wdb { namespace entities { namespace tsp {

    class model : public entities::model {
    public:
        model(std::string owner, std::ifstream& in, optional<int> parent, optional<parameters> params)
            : entities::model(typename entities::info<ptype::tsp>(), owner, in, parent, params)
        {}

        model(const odb::iobject& o)
            : entities::model(o)
        {}

        virtual ~model() override {};
    };

} } }

#endif
