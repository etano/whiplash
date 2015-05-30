#ifndef WDB_ENTITIES_GENERIC_MODEL_HPP
#define WDB_ENTITIES_GENERIC_MODEL_HPP

namespace wdb { namespace entities { namespace generic {

    class model {
    public:
        model(std::ifstream& in) {}

        model(const odb::iobject& o){
            const auto& obj = static_cast<const odb::mongo::object&>(o);
            class_ = reader::String(obj, "class");
        }

        virtual void serialize(odb::iobject& record){
            writer::prop("class", class_) >> record;
        }

        virtual void print(){
            std::cout << "print not defined" << std::endl;
        }

        std::string get_class(){
            return class_;
        }

    protected:
        std::string class_;
    };

} } }

#endif
