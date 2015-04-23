#ifndef SIMFW_ODB_MONGO_COLLECTION_H
#define SIMFW_ODB_MONGO_COLLECTION_H

namespace simfw { namespace odb { namespace mongo {

    class collection : public icollection {
    public:
        typedef mongocxx::collection impl;
        collection(impl coll);
        virtual ~collection(){}
        virtual void list_objects() override;
        virtual const object& find_object(int id) override;
        virtual void print_object(int id) override;
        virtual void insert(iobject& o) override;
                void insert(bsoncxx::builder::basic::document o);
    private:
        impl coll;
    };

} } }

#endif
