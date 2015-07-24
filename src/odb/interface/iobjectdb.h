#ifndef WDB_ODB_IOBJECTDB_H
#define WDB_ODB_IOBJECTDB_H

namespace wdb { namespace odb {

    class iobjectdb {
    public:
        virtual ~iobjectdb(){}
        virtual icollection& provide_collection(std::string name) = 0;
        virtual int get_next_id(std::string collection) = 0;
        virtual void sign(iobject&, std::string collection, std::string owner) = 0;
        virtual void sign(iobject& record, std::string owner, int timestamp) = 0;
    };

} }

#endif
