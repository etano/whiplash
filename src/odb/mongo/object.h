#ifndef WDB_ODB_MONGO_OBJECT_H
#define WDB_ODB_MONGO_OBJECT_H

namespace wdb { namespace odb { namespace mongo {

    class readable {
        using view_type = bsoncxx::v0::document::view;
    public:
        using value_type = bsoncxx::v0::document::value;
        readable(value_type v) : value(v), view(value.view()) {}
        value_type value;
        view_type view;
    };

    class writable {
        using builder_type = bsoncxx::builder::basic::document;
    public:
        writable() = default;
        builder_type builder;
    };

    class object : public iobject {
    public:
        union {
            readable r;
            writable w;
        };
        object(typename readable::value_type value) : r(value) {}
        object() : w() {}
        virtual ~object() override {}
    };

} } }

#endif

