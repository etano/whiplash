#ifndef WDB_ODB_MONGO_SIGNATURE_HPP
#define WDB_ODB_MONGO_SIGNATURE_HPP

namespace wdb { namespace odb { namespace mongo {

    signature::signature(iobject& record){
        this->id_ = prop_reader::read<int>(record, "_id");
        this->owner_ = prop_reader::read<std::string>(record, "owner");
        this->timestamp_ = prop_reader::read<double>(record, "timestamp"); // FIXME: probably OK, but python time.time() is a floating point number
    }

    signature::signature(iobjectdb& db, std::string collection, std::string owner, int timestamp) 
        : id_(db.get_next_id(collection)), owner_(owner), timestamp_(timestamp)
    {
    }

    signature::signature(int id, std::string owner, int timestamp)
        : id_(id), owner_(owner), timestamp_(timestamp)
    {
    }

    int signature::get_id() const {
        return this->id_;
    }

    void signature::touch(){
        this->timestamp_ = (int)std::time(nullptr);
    }

    void signature::sign(iobject& record) const {
        prop_writer::prop("_id", this->id_) >> record;
        prop_writer::prop("timestamp", this->timestamp_) >> record;
        prop_writer::prop("owner", this->owner_) >> record;
    }

} } }

#endif
