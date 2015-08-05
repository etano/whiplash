#ifndef WDB_RTE_ICONTROLLER_DELEGATE_H
#define WDB_RTE_ICONTROLLER_DELEGATE_H

namespace wdb { namespace rte {

    class icontroller_delegate {
    public:
        virtual ~icontroller_delegate(){}
        virtual void resolve(rte::iexecutable& x, wdb::rte::icacheable& m, wdb::rte::icacheable& p) = 0; // type erasure?
    };

} }

#endif
