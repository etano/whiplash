#ifndef WDB_ODB_MONGO_SIGNATURE_HPP
#define WDB_ODB_MONGO_SIGNATURE_HPP

namespace wdb { namespace odb { namespace mongo {

    signature::signature(iobject& record){
        this->id = prop_reader::read<int>(record, "_id");
        this->owner = prop_reader::read<std::string>(record, "owner");
        this->timestamp = prop_reader::read<int>(record, "timestamp");  
    }

    signature::signature(iobjectdb& db, std::string collection, std::string owner, int timestamp) 
        : id(db.get_next_id(collection)), owner(owner), timestamp(timestamp)
    {
    }

    int signature::get_id() const {
        return this->id;
    }

    void signature::touch(){
        this->timestamp = (int)std::time(nullptr);
    }

    void signature::sign(iobject& record) const {
        prop_writer::prop("_id", this->id) >> record;
        prop_writer::prop("timestamp", this->timestamp) >> record;
        prop_writer::prop("owner", this->owner) >> record;
    }

} } }

#endif
