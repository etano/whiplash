#ifndef WDB_ENTITIES_GENERIC_MODEL_HPP
#define WDB_ENTITIES_GENERIC_MODEL_HPP

namespace wdb { namespace entities { namespace generic {

    using wdb::odb::mongo::prop_reader;
    using wdb::odb::mongo::prop_writer;

    class model {
    public:
        model(std::ifstream& in) {}

        model(const odb::iobject& o){
            const auto& obj = static_cast<const odb::mongo::object&>(o);
            class_ =  prop_reader::String(obj, "class");
        }

        void serialize(const int id, const int time_stamp, const bsoncxx::builder::stream::document& doc, odb::iobject& o){
            prop_writer::prop("_id", id) >> o;
            prop_writer::prop("time", time_stamp) >> o;
            for(const auto& a : doc.view())
              if(std::string(a.key()) != "id" && std::string(a.key()) != "time" && std::string(a.key()) != "file"){
                std::string value(a.get_utf8().value);
                prop_writer::prop(std::string(a.key()), value) >> o;
              }
        }

        virtual void print(){std::cout << "print not defined" << std::endl;}

        std::string get_class(){
          return class_;
        }

    protected:
        std::string class_;
    };

} } }

#endif
