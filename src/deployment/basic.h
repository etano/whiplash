#ifndef WDB_DEPLOYMENT_BASIC_H
#define WDB_DEPLOYMENT_BASIC_H

namespace wdb { namespace deployment {

    class basic {
    public:
        basic(odb::iobjectdb& db);
        void purge();

        void insert_executable(std::string location,      // where the executable is stored (this may depend on the machine!)
                               std::string problem_class, // the problem class name on which the executable executes
                               std::string description,   // a description of what the executable does/is capable of
                               std::string algorithm,     // the algorithm that is being executed
                               std::string configuration, // miscellaneous traits of the executable, e.g. annealing schedule
                               std::string version,       // version of the executable
                               std::string build_info,    // specification of how executable was built
                               std::string owner);        // who created the model instance

        void insert_model(std::string file_name,          // contains definition of the model
                          std::string problem_class,      // name of problem class (ex: "JobShop")
                          std::string owner,              // who created the model instance
                          int parent_id = -1,             // if model derived from another model in the database, the id of this parent model (default : "none")
                          std::string lattice = "",       // the lattice structure of the underlying graph (if it exists)
                          std::string distribution = ""); // distribution of the couplings

        void insert_property(std::string problem_class,   // name of problem class
                             int model_id,                // id of the associated model
                             int executable_id,           // id of the associated executable
                             const std::vector<std::string>& params,
                             std::string owner);          // who created the property

        void list_properties();
        void list_model(int id);

        int random_seed();

        std::shared_ptr<rte::iexecutable> fetch_executable(int id);
        std::shared_ptr<entities::generic::model> fetch_model(int id);
        std::shared_ptr<entities::generic::property> fetch_property(int id);
        std::vector<std::shared_ptr<entities::generic::model>> fetch_models_like(odb::iobject& o);
        std::vector<std::shared_ptr<entities::generic::property>> fetch_properties_like(odb::iobject& o);

        template<typename... Args>
        std::vector<std::shared_ptr<odb::iobject>> query(odb::iobject& o, const std::tuple<Args...>& target);

        using reader = wdb::odb::mongo::prop_reader;
        using writer = wdb::odb::mongo::prop_writer;
        using signature = wdb::odb::mongo::signature;
        using object = wdb::odb::mongo::object;
    private:
        odb::icollection& properties;
        odb::icollection& models;
        odb::icollection& executables;
        odb::iobjectdb& db;

        std::mt19937 rng;
        std::uniform_int_distribution<uint32_t> uint_dist;
    };

} }

#endif
