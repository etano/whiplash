#ifndef WDB_ODB_MONGO_OBJECT_H
#define WDB_ODB_MONGO_OBJECT_H

namespace wdb { namespace odb { namespace mongo {

    class readable {
    public:
        using view_type = bsoncxx::v0::document::view;
        using value_type = bsoncxx::v0::document::value;
        readable(value_type v) : value(v), view(value.view()) {}
        readable(view_type v) : value(v), view(value.view()) {}
        value_type value;
        view_type view;
       ~readable() { value.release(); }
    };

    class writable {
        using builder_type = bsoncxx::builder::basic::document;
    public:
        writable() = default;
        builder_type builder;
       ~writable() {}
    };

    class object : public iobject {
    public:
        bool rw;
        union {
            readable r;
            writable w;
        };
        object(typename readable::value_type value) : rw(1), r(value) {}
        object(typename readable::view_type view) : rw(1), r(view) {}
        object() : rw(0), w() {}
        virtual ~object() override { rw ? r.~readable() : w.~writable(); } // TODO: Find better way to do this
    };

} } }

#endif
