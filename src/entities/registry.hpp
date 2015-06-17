#ifndef WDB_ENTITIES_REGISTRY_HPP
#define WDB_ENTITIES_REGISTRY_HPP

namespace wdb { namespace entities {

template<typename... Params>
std::unique_ptr<generic::model> model_registry(std::string class_name, Params&&... parameters) {
    if (class_name == "ising")
        return std::unique_ptr<ising::model>(new ising::model(parameters...));
    else if (class_name =="tsp")
        return std::unique_ptr<tsp::model>(new tsp::model(parameters...));
    else if (class_name =="sat")
        return std::unique_ptr<sat::model>(new sat::model(parameters...));
    else if (class_name =="qubo")
        return std::unique_ptr<qubo::model>(new qubo::model(parameters...));
}

template<typename... Params>
std::unique_ptr<generic::property> property_registry(std::string class_name, Params&&... parameters) {
    if (class_name == "ising")
        return std::unique_ptr<ising::property>(new ising::property(parameters...));
    else if (class_name =="tsp")
        return std::unique_ptr<tsp::property>(new tsp::property(parameters...));
    else if (class_name =="sat")
        return std::unique_ptr<sat::property>(new sat::property(parameters...));
    else if (class_name =="qubo")
        return std::unique_ptr<qubo::property>(new qubo::property(parameters...));
}

} }

#endif
