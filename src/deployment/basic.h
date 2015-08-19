#ifndef WDB_DEPLOYMENT_BASIC_H
#define WDB_DEPLOYMENT_BASIC_H

namespace wdb { namespace deployment {

    class basic {
    public:
        typedef parameters params_type;
        using reader = wdb::odb::mongo::prop_reader;
        using writer = wdb::odb::mongo::prop_writer;
        using signature = wdb::odb::mongo::signature;
        using object = wdb::odb::mongo::object;
        using e = wdb::entities::etype;

        class job_pool : public rte::ipool {
        public:
            job_pool(odb::icollection& t);
            virtual size_t beat() override;
            virtual std::vector<std::shared_ptr<odb::iobject>> quote() override;
            virtual void finalize(odb::iobject& obj, rte::icacheable& p_) override;
        private:
            odb::icollection& tasks;
        };

        basic(odb::iobjectdb& db);
        void format();

        job_pool& get_pool();
        job_pool& get_worker_pool();

        int insert_executable(std::string problem_class,  // the problem class name on which the executable executes
                              std::string owner,          // who created the model instance
                              std::string path,           // where the executable is stored (this may depend on the machine!)
                              std::string description,    // a description of what the executable does/is capable of
                              std::string algorithm,      // the algorithm that is being executed
                              std::string version,        // version of the executable
                              std::string build_info,     // specification of how executable was built
                              optional<params_type> params); // extra parameters object

        int insert_model(std::string problem_class,       // name of problem class (ex: "JobShop")
                         std::string owner,               // who created the model instance
                         std::string path,                // contains definition of the model
                         optional<int> parent_id,         // if model derived from another model in the database, the id of this parent model
                         optional<params_type> params);      // extra parameters object

        std::vector<int> insert_models(std::string problem_class,      // name of problem class (ex: "JobShop")
                         std::string owner,               // who created the model instance
                         const std::vector<std::string>& paths,  // contains definition of the model
                         optional<int> parent_id,         // if model derived from another model in the database, the id of this parent model
                         optional<params_type> params);      // extra parameters object

        int insert_property(std::string problem_class,    // name of problem class
                            std::string owner,            // who created the property
                            int model_id,                 // id of the associated model
                            int executable_id,            // id of the associated executable
                            optional<params_type> params);   // extra parameters object

        std::vector<int> insert_properties(std::string problem_class,    // name of problem class
                            std::string owner,            // who created the property
                            const std::vector<int>& model_ids,  // id of the associated model
                            int executable_id,            // id of the associated executable
                            optional<params_type> params,    // extra parameters object
                            int reps);                    // number of repetitions

        void list_properties();
        void list_model(int id);

        int random_seed();
        int count_undefined(odb::iobject& o);

        std::shared_ptr<entities::executable> fetch_executable(int id);
        std::shared_ptr<entities::model> fetch_model(int id);
        std::shared_ptr<entities::property> fetch_property(int id);
        std::vector<std::shared_ptr<entities::model>> fetch_models_like(odb::iobject& o);
        std::vector<std::shared_ptr<entities::property>> fetch_properties_like(odb::iobject& o);
        std::vector<std::shared_ptr<odb::iobject>> query(odb::iobject& o);
    private:
        odb::icollection& properties;
        odb::icollection& models;
        odb::icollection& executables;
        odb::iobjectdb& db;

        job_pool pool;
        job_pool worker_pool;

        std::mt19937 rng;
        std::uniform_int_distribution<uint32_t> uint_dist;
    };

} }

#endif
