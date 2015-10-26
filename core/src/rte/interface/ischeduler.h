#ifndef WDB_RTE_ISCHEDULER_H
#define WDB_RTE_ISCHEDULER_H

namespace wdb { namespace rte {

    class ischeduler {
    public:
        virtual ~ischeduler(){}

        virtual void expand() = 0;
        virtual void shrink() = 0;

        virtual void schedule(/* what? */) = 0;
    };

} }

#endif
