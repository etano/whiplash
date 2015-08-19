#ifndef WDB_RTE_IPOOL_H
#define WDB_RTE_IPOOL_H

namespace wdb { namespace rte {

    class ipool {
    public:
        virtual ~ipool(){}
        virtual size_t beat() = 0;
        virtual std::vector<std::shared_ptr<odb::iobject>> quote() = 0;
        virtual void submit(odb::iobject& orig, rte::icacheable& mod) = 0;
    };

} }

#endif

