#ifndef SIMFW_ODB_IOBJECTDB_H
#define SIMFW_ODB_IOBJECTDB_H

namespace simfw { namespace odb {

    class iobjectdb {
    public:
        virtual ~iobjectdb(){}
        virtual icollection& provide_collection(std::string name) = 0;
        virtual int get_next_id(std::string collection) = 0;
    };

} }

#endif
