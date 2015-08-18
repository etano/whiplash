#ifndef WDB_RTE_IPOOL_H
#define WDB_RTE_IPOOL_H

namespace wdb { namespace rte {

    class ipool {
    public:
        virtual ~ipool(){}
        virtual size_t beat() = 0;
        virtual std::vector<std::shared_ptr<odb::iobject>> quote() = 0;
        virtual std::shared_ptr<rte::iexecutable> executable(int id) = 0;
        virtual std::shared_ptr<rte::icacheable> model(int id) = 0;
        virtual std::shared_ptr<rte::icacheable> make_property(odb::iobject&) = 0;
        virtual void finalize(odb::iobject& obj, rte::icacheable& p) = 0;
    };

} }

#endif

