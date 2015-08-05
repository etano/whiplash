#ifndef WDB_RTE_SLURM_ROOT_CONTROLLER_HPP
#define WDB_RTE_SLURM_ROOT_CONTROLLER_HPP

namespace wdb { namespace rte { namespace slurm {

    class root_controller : public iroot_controller {
    public:
        virtual ~root_controller() override {}
        virtual void add_controller(icontroller_delegate& dc) override { std::cout << "registering the domain controller\n"; }
        virtual void yield() override { std::cout << "You spin me right round...\n"; }
    };

} } }

#endif
