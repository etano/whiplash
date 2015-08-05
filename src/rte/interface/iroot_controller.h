#ifndef WDB_RTE_IROOT_CONTROLLER_H
#define WDB_RTE_IROOT_CONTROLLER_H

namespace wdb { namespace rte {

    class iroot_controller {
    public:
        virtual ~iroot_controller(){}
        virtual void add_controller(icontroller_delegate& dc) = 0;
        virtual void yield() = 0;
    };

} }

#endif
