#ifndef WDB_DEPLOYMENT_NODE_H
#define WDB_DEPLOYMENT_NODE_H

namespace wdb { namespace deployment {

    class node : public basic<node> {
    public:
        using object = wdb::odb::mongo::object;
        using reader = wdb::odb::mongo::prop_reader;
        using writer = wdb::odb::mongo::prop_writer;
        using signature = wdb::odb::mongo::signature;
        using objectdb = wdb::odb::mongo::objectdb;
        using scheduler = rte::simple::scheduler;
        using root_controller = rte::simple::root_controller;

        class job_pool : public rte::ipool {
        public:
            job_pool(odb::icollection& t, const std::string host);
            virtual size_t size() override;
            virtual std::shared_ptr<odb::iobject> pull() override;
            virtual void process(odb::iobject& orig) override;
            virtual void push(odb::iobject& orig, rte::icacheable& mod) override;
            virtual const std::string& get_host() override;
        private:
            odb::icollection& properties;
            const std::string host;
        };

        node(const std::string host);

        virtual odb::icollection& get_models() override;
        virtual odb::icollection& get_properties() override;
        virtual odb::icollection& get_executables() override;
        virtual odb::iobjectdb& get_db() override;
        virtual rte::ipool& get_pool() override;
        virtual rte::ipool& get_worker_pool() override;
    private:
        objectdb db;
        odb::icollection& models;
        odb::icollection& properties;
        odb::icollection& executables;

        job_pool pool;
        job_pool worker_pool;
    };

} }

#endif