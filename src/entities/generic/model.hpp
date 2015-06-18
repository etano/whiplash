#ifndef WDB_ENTITIES_GENERIC_MODEL_HPP
#define WDB_ENTITIES_GENERIC_MODEL_HPP

namespace wdb { namespace entities { namespace generic {

    class model {
    public:
        model(std::string model_class, std::ifstream& in) {}

        model(std::string model_class, const odb::iobject& o){
            const auto& obj = static_cast<const odb::mongo::object&>(o);
            class_ = reader::String(obj, "class");
            class_id_ = reader::Int(obj, "class_id");
        }

        virtual void serialize(odb::iobject& record){
            writer::prop("class", class_) >> record;
            writer::prop("class_id", class_id_) >> record;
        }

        virtual void print(){
            std::cout << "print not defined" << std::endl;
        }

        std::string get_class(){ return class_; }
    protected:
        std::string class_;
        int class_id_;
    };

} } }

#endif
