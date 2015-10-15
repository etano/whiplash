#ifndef WDB_ODB_MONGO_SIGNATURE_H
#define WDB_ODB_MONGO_SIGNATURE_H

namespace wdb { namespace odb { namespace mongo {

    class signature : public isignature {
    public:
        signature(iobject& s);
        signature(iobjectdb& db, std::string collection, std::string owner);
        signature(int id, std::string owner);
        virtual int get_id() const override;
        virtual void sign(iobject& record) const override;
    private:
        std::string owner_;
        int id_;
    };

} } }

#endif
