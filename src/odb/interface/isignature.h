#ifndef WDB_ODB_ISIGNATURE_H
#define WDB_ODB_ISIGNATURE_H

namespace wdb { namespace odb {

    class isignature {
    public:
        virtual void touch() = 0;
        virtual int get_id() const = 0;
        virtual void sign(iobject& record) const = 0;
    };

} }

#endif
