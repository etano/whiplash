#ifndef WDB_RTE_CLUSTER_EXECUTABLE_HPP
#define WDB_RTE_CLUSTER_EXECUTABLE_HPP

namespace wdb { namespace rte { namespace cluster {

    class controller : public icontroller {
    public:
        virtual ~controller() override {}
    };

} } }

#endif
