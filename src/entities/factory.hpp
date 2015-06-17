#ifndef WDB_ENTITIES_FACTORY_HPP
#define WDB_ENTITIES_FACTORY_HPP

namespace wdb { namespace entities { namespace factory {

    template<typename... Params>
    std::unique_ptr<generic::model> make_model(std::string class_name, Params&&... parameters) {
        if (class_name == "ising")
            return std::unique_ptr<ising::model>(new ising::model(parameters...));
        else if (class_name =="tsp")
            return std::unique_ptr<tsp::model>(new tsp::model(parameters...));
        else if (class_name =="sat")
            return std::unique_ptr<sat::model>(new sat::model(parameters...));
        else if (class_name =="qubo")
            return std::unique_ptr<qubo::model>(new qubo::model(parameters...));
    }

    std::unique_ptr<entities::generic::model> make_model(odb::iobject& o){
        std::string model_class = entities::generic::reader::String(o, "class");
        return make_model(model_class, o);
    }

    template<typename... Params>
    std::unique_ptr<generic::property> make_property(std::string class_name, Params&&... parameters) {
        if (class_name == "ising")
            return std::unique_ptr<ising::property>(new ising::property(parameters...));
        else if (class_name =="tsp")
            return std::unique_ptr<tsp::property>(new tsp::property(parameters...));
        else if (class_name =="sat")
            return std::unique_ptr<sat::property>(new sat::property(parameters...));
        else if (class_name =="qubo")
            return std::unique_ptr<qubo::property>(new qubo::property(parameters...));
    }

    std::string get_model_class(int model_id){ // just a convenience stub. refactor me...
        switch(model_id){
            case 1 : return "ising";
            case 2 : return "tsp";
            case 3 : return "qubo";
            case 4 : return "sat";
        }
        printf("Hey model id is %d\n", model_id);
        throw std::runtime_error("Unknown model class");
    }

} } }

#endif
