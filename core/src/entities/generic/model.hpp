#ifndef WDB_ENTITIES_GENERIC_MODEL_HPP
#define WDB_ENTITIES_GENERIC_MODEL_HPP

#include <fstream>

namespace wdb { namespace entities {

    class model : public wdb::rte::icacheable {
    public:
        template<class I>
        model(I info, std::string owner, std::ifstream& in, optional<int> parent, optional<parameters> params){
            class_ = I::name;
            owner_ = owner;
            parent_ = parent;
            params_ = params;
        }

        model(const odb::iobject& o){
            class_ = reader::read<std::string>(o, "class");
            owner_ = reader::read<std::string>(o, "owner");
            parent_ = reader::read<int>(o, "parent");
            params_ = reader::read<parameters>(o, "params");
        }

        virtual ~model() {};

        virtual void serialize_cfg(odb::iobject& cfg) {}

        virtual void serialize(odb::iobject& record, odb::iobject& cfg){
            writer::prop("class", class_) >> record;
            writer::prop("owner", owner_) >> record;
            if (parent_)
                writer::prop("parent", parent_) >> record;
            if (params_)
                if (params_.unwrap().get_container())
                    writer::prop("params", params_) >> record;
            writer::prop("cfg", cfg) >> record;
        }

        virtual void print(){
            std::cerr << "print not defined" << std::endl;
        }

        std::string get_class(){ return class_; }
    protected:
        std::string class_;
        std::string owner_;
        optional<int> parent_;
        optional<parameters> params_;
    };

} }

#endif
