#ifndef WDB_ODB_IOBJECTDB_H
#define WDB_ODB_IOBJECTDB_H

namespace wdb { namespace odb {

    class iobjectdb {
    public:
        virtual ~iobjectdb(){}
        virtual icollection& drop_collection(std::string name) = 0;
        virtual icollection& provide_collection(std::string name) = 0;
        virtual int get_next_id(std::string collection) = 0;
    };

} }

#endif
