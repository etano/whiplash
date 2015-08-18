#ifndef WDB_RTE_ICONTROLLER_DELEGATE_H
#define WDB_RTE_ICONTROLLER_DELEGATE_H

namespace wdb { namespace rte {

    class icontroller_delegate {
    public:
        virtual ~icontroller_delegate(){}
        virtual void resolve(odb::iobject& obj, ipool& provider) = 0;
        virtual void prepare_for_segue(icontroller_delegate& dest) = 0;
    };

} }

#endif
