#ifndef WDB_ODB_MONGO_SIGNATURE_H
#define WDB_ODB_MONGO_SIGNATURE_H

namespace wdb { namespace odb { namespace mongo {

    class signature : public isignature {
    public:
        signature(iobject& s);
        signature(iobjectdb& db, std::string collection, std::string owner, int timestamp = (int)std::time(nullptr));
        virtual void touch() override;
        virtual int get_id() const override;
        virtual void sign(iobject& record) const override;
    private:
        std::string owner;
        int timestamp;
        int id;
    };

} } }

#endif
