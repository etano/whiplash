#ifndef WDB_RTE_SLURM_SCHEDULER_HPP
#define WDB_RTE_SLURM_SCHEDULER_HPP

namespace wdb { namespace rte { namespace slurm {

    class scheduler : public ischeduler {
    public:
        virtual ~scheduler() override {}

        virtual void expand() override {}
        virtual void shrink() override {}

        virtual void schedule(/* what? */) override {}
    };

} } }

#endif
