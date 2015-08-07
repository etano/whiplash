#ifndef WDB_ODB_MONGO_COLLECTION_H
#define WDB_ODB_MONGO_COLLECTION_H

namespace wdb { namespace odb { namespace mongo {

    class collection : public icollection {
    public:
        typedef mongocxx::collection impl;
        collection(impl coll);
        virtual ~collection(){}
        virtual void list_objects() override;
        virtual std::shared_ptr<iobject> find(int id) override;
        virtual std::vector<std::shared_ptr<iobject>> find_like(iobject& o) override;
        virtual void print_object(int id) override;
        virtual int insert(iobject& o, const isignature& s) override;
        virtual int insert_many(std::vector<std::shared_ptr<iobject>>& os, const isignature& s) override;
        virtual void remove(iobject& o) override;
        virtual void replace(iobject& o_old, iobject& o_new, const isignature& s) override;
        virtual void update(iobject& o_old, iobject& o_new) override;
        virtual void purge() override;
    private:
        impl coll;
    };

} } }

#endif
