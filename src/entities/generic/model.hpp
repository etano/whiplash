#ifndef WDB_ENTITIES_GENERIC_MODEL_HPP
#define WDB_ENTITIES_GENERIC_MODEL_HPP

namespace wdb { namespace entities {

    template<ptype Problem>
    struct info {};

} }

namespace wdb { namespace entities { namespace generic {

    class model : public wdb::rte::icacheable {
    public:
        template<class I>
        model(I info, std::ifstream& in, optional<int> parent, const optional<dictionary>& params){
            class_ = I::name;
            parent_ = parent;
            params_ = params;
        }

        model(const odb::iobject& o){
            class_ = reader::read<std::string>(o, "class");
            parent_ = reader::read<int>(o, "parent");
            params_ = reader::read<dictionary>(o, std::tie("cfg", "params"));
        }

        virtual ~model() {};

        virtual void serialize_cfg(odb::iobject& cfg) {}

        virtual void serialize(odb::iobject& record, odb::iobject& cfg){
            writer::prop("class", class_) >> record;
            if (parent_)
                writer::prop("parent", parent_) >> record;
            if (params_)
                writer::prop("params", params_) >> cfg;
            writer::prop("cfg", cfg) >> record;
        }

        virtual void print(){
            std::cout << "print not defined" << std::endl;
        }

        std::string get_class(){ return class_; }
    protected:
        std::string class_;
        optional<int> parent_;
        optional<dictionary> params_;
    };

} } }

#endif
