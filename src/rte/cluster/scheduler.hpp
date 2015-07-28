#ifndef WDB_RTE_CLUSTER_SCHEDULER_HPP
#define WDB_RTE_CLUSTER_SCHEDULER_HPP

namespace wdb { namespace rte { namespace cluster {

    class scheduler : public ischeduler {
    public:
        virtual ~scheduler() override {}
        virtual void subscribe(icontroller& dc) override { std::cout << "registering the domain controller\n"; }
    };

} } }

#endif
