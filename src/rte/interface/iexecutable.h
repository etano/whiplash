#ifndef WDB_RTE_IEXECUTABLE_H
#define WDB_RTE_IEXECUTABLE_H

namespace wdb { namespace rte {

    class iexecutable {
    public:
        virtual ~iexecutable(){}
        virtual void operator()(int argc, char** argv) = 0;
        virtual void operator()() = 0;
    };

} }

#endif
