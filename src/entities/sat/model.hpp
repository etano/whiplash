#ifndef WDB_ENTITIES_SAT_MODEL_HPP
#define WDB_ENTITIES_SAT_MODEL_HPP

namespace wdb { namespace entities { namespace sat {

    class model : public entities::model {
    public:
        model(std::string owner, std::ifstream& in, optional<int> parent, optional<parameters> params)
            : entities::model(typename entities::info<ptype::sat>(), owner, in, parent, params)
        {}

        model(const odb::iobject& o)
            : entities::model(o)
        {}

        virtual ~model() override {};
    };

} } }

#endif
