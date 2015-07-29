#ifndef WDB_RTE_ICONTROLLER_DELEGATE_H
#define WDB_RTE_ICONTROLLER_DELEGATE_H

namespace wdb { namespace rte {

    template<class Model, class Property>
    class icontroller_delegate {
    public:
        virtual ~icontroller_delegate(){}
        virtual void resolve(rte::iexecutable& x, Model& m, Property& p) = 0;
    };

} }

#endif
