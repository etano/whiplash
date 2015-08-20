#ifndef WDB_DEPLOYMENT_BASIC_H
#define WDB_DEPLOYMENT_BASIC_H

namespace wdb { namespace deployment {

    template<class D>
    class basic {
    public:
        typedef parameters params_type;
        using e = wdb::entities::etype;

        basic() : rng( wdb::timer::now() ) {}
        void format();

        int insert_model(std::string problem_class,                            // name of problem class (ex: "JobShop")
                         std::string owner,                                    // who created the model instance
                         std::string path,                                     // contains definition of the model
                         optional<int> parent_id,                              // if model derived from another model in the database, the id of this parent model
                         optional<params_type> params);                        // extra parameters object

        int insert_property(std::string problem_class,                         // name of problem class
                            std::string owner,                                 // who created the property
                            int model_id,                                      // id of the associated model
                            int executable_id,                                 // id of the associated executable
                            optional<params_type> params);                     // extra parameters object

        int insert_executable(std::string problem_class,                       // the problem class name on which the executable executes
                              std::string owner,                               // who created the model instance
                              std::string path,                                // where the executable is stored (this may depend on the machine!)
                              std::string description,                         // a description of what the executable does/is capable of
                              std::string algorithm,                           // the algorithm that is being executed
                              std::string version,                             // version of the executable
                              std::string build_info,                          // specification of how executable was built
                              optional<params_type> params);                   // extra parameters object

        std::vector<int> insert_models(std::string problem_class,              // name of problem class (ex: "JobShop")
                                       std::string owner,                      // who created the model instance
                                       const std::vector<std::string>& paths,  // contains definition of the model
                                       optional<int> parent_id,                // if model derived from another model in the database, the id of this parent model
                                       optional<params_type> params);          // extra parameters object

        std::vector<int> insert_properties(std::string problem_class,          // name of problem class
                                           std::string owner,                  // who created the property
                                           const std::vector<int>& model_ids,  // id of the associated model
                                           int executable_id,                  // id of the associated executable
                                           optional<params_type> params,       // extra parameters object
                                           int reps);                          // number of repetitions

        void list_properties();
        void list_model(int id);

        int random_seed();
        int count_undefined(odb::iobject& o);

        std::shared_ptr<entities::model> fetch_model(int id);
        std::shared_ptr<entities::property> fetch_property(int id);
        std::shared_ptr<entities::executable> fetch_executable(int id);
        std::vector<std::shared_ptr<entities::model>> fetch_models_like(odb::iobject& o);
        std::vector<std::shared_ptr<entities::property>> fetch_properties_like(odb::iobject& o);

        std::vector<std::shared_ptr<odb::iobject>> query(odb::iobject& o);

        virtual odb::icollection& get_models() = 0;
        virtual odb::icollection& get_properties() = 0;
        virtual odb::icollection& get_executables() = 0;
        virtual odb::iobjectdb& get_db() = 0;
        virtual rte::ipool& get_pool() = 0;
        virtual rte::ipool& get_worker_pool() = 0;
    protected:
        std::mt19937 rng;
        std::uniform_int_distribution<uint32_t> uint_dist;
    };

} }

#endif
