#ifndef SIMFW_RTE_IEXECUTABLE_HPP
#define SIMFW_RTE_IEXECUTABLE_HPP

namespace simfw { namespace rte {

    class iexecutable {
    public:
        virtual ~iexecutable(){}
        virtual void operator()(int argc, char** argv) = 0;
        virtual void operator()() = 0;
    };

} }

#endif
