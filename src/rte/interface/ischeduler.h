#ifndef WDB_RTE_ISCHEDULER_H
#define WDB_RTE_ISCHEDULER_H

namespace wdb { namespace rte {

    class ischeduler {
    public:
        virtual ~ischeduler(){}
        virtual void subscribe(icontroller& dc) = 0;

        virtual void expand(size_t res) = 0;
        virtual void shrink(size_t res) = 0;

        virtual void schedule(/* what? */) = 0;
    };

} }

#endif
