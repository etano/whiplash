#ifndef WDB_ENTITIES_FACTORY_HPP
#define WDB_ENTITIES_FACTORY_HPP

namespace wdb { namespace entities { namespace factory {

    std::map<std::string,int> class_id_by_name = {{"ising",1}, {"tsp",2}, {"qubo",3}, {"sat",4}};
    std::map<int,std::string> class_name_by_id = {{1,"ising"}, {2,"tsp"}, {3,"qubo"}, {4,"sat"}};

    template<typename... Params>
    std::shared_ptr<generic::model> make_model(std::string class_name, Params&&... parameters) {
        int class_id = class_id_by_name[class_name];
        switch(class_id){
            case 1 : return std::shared_ptr<ising::model>(new ising::model(class_name, parameters...));
            case 2 : return std::shared_ptr<tsp::model>(new tsp::model(class_name, parameters...));
            case 3 : return std::shared_ptr<qubo::model>(new qubo::model(class_name, parameters...));
            case 4 : return std::shared_ptr<sat::model>(new sat::model(class_name, parameters...));
        }
        printf("Hey model class id is %d\n", class_id);
        throw std::runtime_error("Unknown model class");
    }

    std::shared_ptr<entities::generic::model> make_model(odb::iobject& o){
        std::string model_class = entities::reader::String(o, "class");
        return make_model(model_class, o);
    }

    template<typename... Params>
    std::shared_ptr<generic::property> make_property(std::string class_name, Params&&... parameters) {
        int class_id = class_id_by_name[class_name];
        switch(class_id){
            case 1 : return std::shared_ptr<ising::property>(new ising::property(class_name, parameters...));
            case 2 : return std::shared_ptr<tsp::property>(new tsp::property(class_name, parameters...));
            case 3 : return std::shared_ptr<qubo::property>(new qubo::property(class_name, parameters...));
            case 4 : return std::shared_ptr<sat::property>(new sat::property(class_name, parameters...));
        }
        printf("Hey model class id is %d\n", class_id);
        throw std::runtime_error("Unknown model class");
    }

    std::shared_ptr<entities::generic::property> make_property(odb::iobject& o){
        std::string model_class = entities::reader::String(o, "class");
        return entities::factory::make_property(model_class,o);
    }

} } }

#endif
