#ifndef SIMFW_ODB_ICOLLECTION_H
#define SIMFW_ODB_ICOLLECTION_H

namespace simfw { namespace odb {

    class icollection {
    public:
        virtual ~icollection(){}
        virtual void list_objects() = 0;
        virtual void find_object(int id) = 0;
        virtual void insert(iobject& o) = 0;
    };

} }

#endif
