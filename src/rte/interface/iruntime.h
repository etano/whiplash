#ifndef WDB_RTE_IRUNTIME_H
#define WDB_RTE_IRUNTIME_H

namespace wdb { namespace rte {

    class iruntime {
    public:
        virtual ~iruntime(){}
        virtual void subscribe(icontroller& dc) = 0;
    };

} }

#endif
