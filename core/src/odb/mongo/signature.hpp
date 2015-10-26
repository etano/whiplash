#ifndef WDB_ODB_MONGO_SIGNATURE_HPP
#define WDB_ODB_MONGO_SIGNATURE_HPP

namespace wdb { namespace odb { namespace mongo {

    signature::signature(iobject& record){
        this->id_ = prop_reader::read<int>(record, "_id");
        this->owner_ = prop_reader::read<std::string>(record, "owner");
    }

    signature::signature(iobjectdb& db, std::string collection, std::string owner) 
        : id_(db.get_next_id(collection)), owner_(owner)
    {
    }

    signature::signature(int id, std::string owner)
        : id_(id), owner_(owner)
    {
    }

    int signature::get_id() const {
        return this->id_;
    }

    void signature::sign(iobject& record) const {
        prop_writer::prop("_id", this->id_) >> record;
        prop_writer::prop("timestamp", (int)std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::system_clock::now().time_since_epoch()).count()) >> record;
        prop_writer::prop("owner", this->owner_) >> record;
    }

} } }

#endif
