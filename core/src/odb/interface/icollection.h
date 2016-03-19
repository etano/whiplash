#ifndef WDB_ODB_ICOLLECTION_H
#define WDB_ODB_ICOLLECTION_H

namespace wdb { namespace odb {

    class iobjectdb;

    class icollection {
    public:
        virtual ~icollection(){}
        virtual void list_objects() = 0;
        virtual std::shared_ptr<iobject> create() = 0;
        virtual std::shared_ptr<iobject> find(int id) = 0;
        virtual std::vector<std::shared_ptr<iobject>> find_like(iobject& o) = 0;
        virtual std::shared_ptr<iobject> find_one_and_update(iobject& filter, iobject& mod) = 0;
        virtual void print_object(int id) = 0;
        virtual int insert(iobject& o, const isignature& s) = 0;
        virtual std::vector<int> insert_many(std::vector<std::shared_ptr<iobject>>& os, iobjectdb& db, std::string collection, std::string owner) = 0;
        virtual void remove(iobject& o) = 0;
        virtual void replace(iobject& filter, iobject& o_new, const isignature& s) = 0;
        virtual void replace(iobject& o_old, iobject& o_new) = 0;
        virtual void update(iobject& o_old, iobject& o_new) = 0;
        virtual void purge() = 0;
    };

} }

#endif
