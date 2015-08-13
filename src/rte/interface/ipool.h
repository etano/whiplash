#ifndef WDB_RTE_IPOOL_H
#define WDB_RTE_IPOOL_H

namespace wdb { namespace rte {

    class ipool {
    public:
        virtual ~ipool(){}
        virtual size_t beat() = 0;
    };

} }

#endif

