#ifndef WDB_DEPLOYMENT_BASIC_HPP
#define WDB_DEPLOYMENT_BASIC_HPP

#include <ctime>

namespace wdb { namespace deployment {

    basic::basic(odb::iobjectdb& db)
      : db(db),
        properties( db.provide_collection("properties") ),
        models( db.provide_collection("models") ),
        counters( db.provide_collection("counters") )
    {
    }

    void basic::resolve_property(){
      // TODO
    }

    void basic::drop_collections(){
        db.drop_collection("properties");
        db.drop_collection("models");
    }

    void basic::init_counters(){
        using odb::mongo::prop_writer;
        odb::mongo::object properties_counter;
        prop_writer::prop("_id", "properties") >> properties_counter;
        static_cast<odb::mongo::collection&>(counters).remove( properties_counter );
        prop_writer::prop("seq", -1) >> properties_counter;
        static_cast<odb::mongo::collection&>(counters).insert( properties_counter );
        odb::mongo::object models_counter;
        prop_writer::prop("_id", "models") >> models_counter;
        static_cast<odb::mongo::collection&>(counters).remove( models_counter );
        prop_writer::prop("seq", -1) >> models_counter;
        static_cast<odb::mongo::collection&>(counters).insert( models_counter );
        odb::mongo::object executables_counter;
        prop_writer::prop("_id", "executables") >> executables_counter;
        static_cast<odb::mongo::collection&>(counters).remove( executables_counter );
        prop_writer::prop("seq", -1) >> executables_counter;
        static_cast<odb::mongo::collection&>(counters).insert( executables_counter );
    }

    void basic::insert_property(int model_id, int executable_id, const std::vector<std::string>& params){
      std::string model_class = fetch_model(model_id).get_class();
      std::unique_ptr<entities::generic::property> pb;
      if (model_class == "ising")
          pb = std::unique_ptr<entities::ising::property>(new entities::ising::property(model_id, executable_id, params));
      else
          pb = std::unique_ptr<entities::generic::property>(new entities::generic::property(model_id, executable_id, params));
      odb::mongo::object serialized, serialized_state;
      pb->serialize_state(serialized_state);
      pb->serialize(db.get_next_id("properties"), serialized, serialized_state);
      static_cast<odb::mongo::collection&>(properties).insert( serialized );
    }

    void basic::insert_model(const bsoncxx::builder::stream::document& doc)
    {
      const std::string file_name(doc.view()["file"].get_utf8().value);
      const std::string model_class(doc.view()["class"].get_utf8().value);
      std::ifstream in(file_name);
      std::unique_ptr<entities::generic::model> H;
      if (model_class == "ising")
          H = std::unique_ptr<entities::ising::model>(new entities::ising::model(in));
      else
          H = std::unique_ptr<entities::generic::model>(new entities::generic::model(in));
      in.close();
      odb::mongo::object serialized;
      H->serialize(db.get_next_id("models"),std::time(nullptr),doc,serialized);
      static_cast<odb::mongo::collection&>(models).insert(serialized);
    }

    void basic::insert_executable(const bsoncxx::builder::stream::document& doc)
    {
      //TODO
    }

    entities::generic::model basic::fetch_model(int id){
      return entities::generic::model( *models.find_object(id) );
    }

    entities::generic::property basic::fetch_property(int id){
      return entities::generic::property( *properties.find_object(id) );
    }

    void basic::list_properties(){
      properties.list_objects();
    }

    void basic::list_model(int id){
      models.print_object(id);
    }

    rte::iexecutable& basic::load(std::string app){
      static rte::cluster::executable inst(app);
      return inst;
    }

  } }

#endif
