#ifndef WDB_RTE_CLUSTER_RUNTIME_HPP
#define WDB_RTE_CLUSTER_RUNTIME_HPP

namespace wdb { namespace rte { namespace cluster {

    class runtime : public iruntime {
    public:
        virtual ~runtime() override {}
        virtual void subscribe(icontroller& dc) override { std::cout << "registering the domain controller\n"; }
    };

} } }

#endif
