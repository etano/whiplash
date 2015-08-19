#ifndef WDB_RTE_IAPP_H
#define WDB_RTE_IAPP_H

namespace wdb { namespace rte {

    class iapp {
    public:
        virtual ~iapp(){}
        virtual void operator()(int argc, char** argv) = 0;
        virtual void operator()() = 0;
    };

} }

#endif
