#ifndef WDB_ENTITIES_TSP_MODEL_HPP
#define WDB_ENTITIES_TSP_MODEL_HPP

namespace wdb { namespace entities { namespace tsp {

    class model : public generic::model {
    public:
        model(std::ifstream& in, int parent, const std::unordered_map<std::string,std::string>& params)
            : generic::model(typename entities::info<ptype::tsp>(), in, parent, params)
        {}

        model(const odb::iobject& o)
            : generic::model(o)
        {}

        virtual ~model() override {};
    };

} } }

#endif
