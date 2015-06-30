#ifndef WDB_ENTITIES_FACTORY_HPP
#define WDB_ENTITIES_FACTORY_HPP

namespace wdb { namespace entities { 

    enum class type {
        unknown, ising, tsp, qubo, sat
    };
        
    class factory {
    public:
        template<typename... Params>
        static std::shared_ptr<generic::model> make_model(std::string class_name, Params&&... parameters) {
            switch(lookup_table[class_name]){
                case type::ising : return std::shared_ptr<ising::model>(new ising::model(class_name, parameters...));
                case type::tsp   : return std::shared_ptr<tsp::model>(new tsp::model(class_name, parameters...));
                case type::qubo  : return std::shared_ptr<qubo::model>(new qubo::model(class_name, parameters...));
                case type::sat   : return std::shared_ptr<sat::model>(new sat::model(class_name, parameters...));
            }
            throw std::runtime_error("Unknown model class");
        }
        
        template<typename... Params>
        static std::shared_ptr<generic::property> make_property(std::string class_name, Params&&... parameters) {
            switch(lookup_table[class_name]){
                case type::ising : return std::shared_ptr<ising::property>(new ising::property(class_name, parameters...));
                case type::tsp   : return std::shared_ptr<tsp::property>(new tsp::property(class_name, parameters...));
                case type::qubo  : return std::shared_ptr<qubo::property>(new qubo::property(class_name, parameters...));
                case type::sat   : return std::shared_ptr<sat::property>(new sat::property(class_name, parameters...));
            }
            throw std::runtime_error("Unknown model class");
        }
        
        static std::shared_ptr<generic::model> make_model(odb::iobject& o){
            std::string model_class = reader::String(o, "class");
            return make_model(model_class, o);
        }
        
        static std::shared_ptr<generic::property> make_property(odb::iobject& o){
            std::string model_class = reader::String(o, "class");
            return make_property(model_class, o);
        }

        static std::unordered_map<std::string, type> lookup_table;
    };

    std::unordered_map<std::string, type> factory::lookup_table {
        { "ising", type::ising },
        { "tsp",   type::tsp },
        { "qubo",  type::qubo },
        { "sat",   type::sat }
    };

} }

#endif
