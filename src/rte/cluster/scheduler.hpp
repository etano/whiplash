#ifndef WDB_RTE_CLUSTER_SCHEDULER_HPP
#define WDB_RTE_CLUSTER_SCHEDULER_HPP

namespace wdb { namespace rte { namespace cluster {

    class scheduler : public ischeduler {
    public:
        virtual ~scheduler() override {}

        virtual void expand(size_t res) override {}
        virtual void shrink(size_t res) override {}

        virtual void schedule(/* what? */) override {}
    };

} } }

#endif
