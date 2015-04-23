#ifndef SIMFW_ODB_MONGO_OBJECT_H
#define SIMFW_ODB_MONGO_OBJECT_H

namespace simfw { namespace odb { namespace mongo {

    class object : public iobject {
        using object_view = bsoncxx::v0::document::view;
    public:
        object(object_view view) : view(view) {}
        object_view view;
    };

} } }

#endif

