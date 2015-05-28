#ifndef WDB_ENTITIES_GENERIC_PROPERTY_HPP
#define WDB_ENTITIES_GENERIC_PROPERTY_HPP

namespace wdb { namespace entities { namespace generic {

    using wdb::odb::mongo::prop_reader;
    using wdb::odb::mongo::prop_writer;

    class property {
    public:
        property(const odb::iobject& o){
            const auto& obj = static_cast<const odb::mongo::object&>(o);
            model_      = prop_reader::Int(obj, "model_id");
            executable_ = prop_reader::Int(obj, "executable_id");
            for(auto e : prop_reader::Array(obj, "params"))
                params_.push_back(prop_reader::String(e));
        }

        void info(){
            std::cout << "Model: " << model_ << "\n";
            std::cout << "Executable: " << executable_ << "\n";
            std::cout << "Params: "; for(auto e : params_) std::cout << e << " ";
            std::cout << "\n";
        }

        template<int N>
        std::string param(){
            return params_[N];
        }

        property(int model_id, int executable_id, const std::vector<std::string>& params)
            : model_(model_id), executable_(executable_id), params_(params)
        {}

        virtual void serialize_state(odb::iobject& state) {}

        void serialize(int id, odb::iobject& inst, const odb::iobject& state){
            prop_writer::prop("_id", id) >> inst;
            prop_writer::prop("model_id", model_) >> inst;
            prop_writer::prop("executable_id", executable_) >> inst;
            prop_writer::prop("params", params_) >> inst;
            prop_writer::prop("state", state) >> inst;
        }
    private:
        int model_;
        int executable_;
        std::vector<std::string> params_;
    };

} } }

#endif
