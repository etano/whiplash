#ifndef WDB_DEPLOYMENT_BASIC_H
#define WDB_DEPLOYMENT_BASIC_H

namespace wdb { namespace deployment {

    class basic {
    public:
        basic(odb::iobjectdb& db);
        void resolve_property();
        void assume_property(int hid, std::string solver, const std::vector<std::string>& params);
        void insert_hamil(std::ifstream& in);
        void list_properties();
        void list_hamil(int id);

        entities::generic::hamil fetch_hamil(int id);
        entities::generic::property fetch_property(int id);

        rte::iexecutable& load(std::string app);
    private:
        odb::icollection& properties;
        odb::icollection& hamiltonians;
        odb::iobjectdb& db;
    };

} }

#endif
