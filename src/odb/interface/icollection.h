#ifndef WDB_ODB_ICOLLECTION_H
#define WDB_ODB_ICOLLECTION_H

namespace wdb { namespace odb {

    class icollection {
    public:
        virtual ~icollection(){}
        virtual void list_objects() = 0;
        virtual std::unique_ptr<iobject> find_object(int id) = 0;
        virtual void print_object(int id) = 0;
        virtual void insert(iobject& o) = 0;
    };

} }

#endif
