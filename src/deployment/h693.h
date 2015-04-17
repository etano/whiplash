#ifndef SIMFW_DEPLOYMENT_H693_H
#define SIMFW_DEPLOYMENT_H693_H

namespace simfw { namespace deployment {

    class h693 {
    public:
        h693(odb::iobjectdb& db);
        void insert_instance(int hid, std::string solver, const std::vector<std::string>& params);
        void insert_hamil(std::ifstream& in);
        void list_instances();
        void list_hamil(int id);

        rte::iexecutable& load(std::string app);
    private:
        odb::icollection& instances;
        odb::icollection& hamiltonians;
        odb::iobjectdb& db;
    };

} }

#endif
