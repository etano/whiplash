#ifndef WDB_RTE_ISCHEDULER_H
#define WDB_RTE_ISCHEDULER_H

namespace wdb { namespace rte {

    class ischeduler {
    public:
        virtual ~ischeduler(){}
        virtual void subscribe(icontroller& dc) = 0;
    };

} }

#endif
