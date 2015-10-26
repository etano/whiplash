#ifndef WDB_RTE_IROOT_CONTROLLER_H
#define WDB_RTE_IROOT_CONTROLLER_H

namespace wdb { namespace rte {

    class iroot_controller {
    public:
        virtual ~iroot_controller(){}
        virtual void add_controller(icontroller_delegate& ctrl) = 0;
        virtual void declare_segue(icontroller_delegate& src, icontroller_delegate& dst) = 0;
        virtual void yield() = 0;
    };

} }

#endif
