#ifndef WDB_ODB_ICOLLECTION_H
#define WDB_ODB_ICOLLECTION_H

namespace wdb { namespace odb {

    class icollection {
    public:
        virtual ~icollection(){}
        virtual void list_objects() = 0;
        virtual std::shared_ptr<iobject> find(int id) = 0;
        virtual std::vector<std::shared_ptr<iobject>> find_like(iobject& o) = 0;
        virtual void print_object(int id) = 0;
        virtual int insert(iobject& o, const isignature& s) = 0;
        virtual void remove(iobject& o) = 0;
        virtual void replace(iobject& o_old, iobject& o_new, const isignature& s) = 0;
        virtual void update(iobject& o_old, iobject& o_new) = 0;
        virtual void purge() = 0;
    };

} }

#endif
