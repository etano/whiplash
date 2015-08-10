#ifndef WDB_RTE_SIMPLE_SCHEDULER_HPP
#define WDB_RTE_SIMPLE_SCHEDULER_HPP

namespace wdb { namespace rte { namespace simple {

    class scheduler : public ischeduler {
    public:
        virtual ~scheduler() override {}

        virtual void expand(size_t res) override {}
        virtual void shrink(size_t res) override {}

        virtual void schedule() override {}
    };

} } }

#endif
