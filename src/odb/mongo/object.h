#ifndef SIMFW_ODB_MONGO_OBJECT_H
#define SIMFW_ODB_MONGO_OBJECT_H

namespace simfw { namespace odb { namespace mongo {

    class object : public iobject {
        using object_view = bsoncxx::v0::document::view;
        using object_value = bsoncxx::v0::document::value;
    public:
        object(object_value v) : value(v), view(value.view()) {}
        object_value value;
        object_view view;
    };

} } }

#endif

