#ifndef SIMFW_ENTITIES_GENERIC_INSTANCE_HPP
#define SIMFW_ENTITIES_GENERIC_INSTANCE_HPP

namespace simfw { namespace entities { namespace generic {

    using simfw::odb::mongo::prop_reader;
    using simfw::odb::mongo::prop_writer;

    class instance {
    public:
        instance(const odb::iobject& o){
        }

        instance(int hid, std::string solver, const std::vector<std::string>& params) 
            : h_(hid),
            solver_(solver),
            params_(params)
        {
        }

        void serialize_state(odb::iobject& state){
            // todo // save the actual state
            prop_writer::prop("config", std::vector<double>(1, std::numeric_limits<double>::quiet_NaN())) >> state;
            prop_writer::prop("cost", std::numeric_limits<double>::quiet_NaN()) >> state;
        }

        void serialize(int id, odb::iobject& inst, const odb::iobject& state){
            prop_writer::prop("_id", id) >> inst;
            prop_writer::prop("hid", h_) >> inst;
            prop_writer::prop("solver", solver_) >> inst;
            prop_writer::prop("params", params_) >> inst;
            prop_writer::prop("state", state) >> inst;
        }
    private:
        int h_;
        std::string solver_;
        std::vector<std::string> params_;
    };

} } }

#endif
