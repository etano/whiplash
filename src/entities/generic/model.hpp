#ifndef WDB_ENTITIES_GENERIC_MODEL_HPP
#define WDB_ENTITIES_GENERIC_MODEL_HPP

namespace wdb { namespace entities { 

    template<ptype Problem>
    struct info {};

} }
    
namespace wdb { namespace entities { namespace generic {

    class model {
    public:
        template<class I>
        model(I info, std::ifstream& in, int parent){
            class_ = I::name;
            parent_ = parent;
        }

        model(const odb::iobject& o){
            class_ = reader::read<std::string>(o, "class");
            class_id_ = reader::read<int>(o, "class_id");
            parent_ = reader::read<int>(o, "parent");
        }

        virtual ~model() {};

        virtual void serialize_cfg(odb::iobject& cfg) {}

        virtual void serialize(odb::iobject& record, odb::iobject& cfg){
            writer::prop("class", class_) >> record;
            writer::prop("class_id", class_id_) >> record;
            writer::prop("parent", parent_) >> record;
            writer::prop("cfg", cfg) >> record;
        }

        virtual void print(){
            std::cout << "print not defined" << std::endl;
        }

        std::string get_class(){ return class_; }
    protected:
        std::string class_;
        int class_id_;
        int parent_;
    };

} } }

#endif
