#ifndef WDB_ENTITIES_UEVOL_PROPERTY_HPP
#define WDB_ENTITIES_UEVOL_PROPERTY_HPP

#include <entities/generic/property.hpp>

namespace wdb { namespace entities { namespace uevol {
    
    class property : public entities::property {
    public:
        property(const odb::iobject& o)
            : entities::property(o)
        {}
        
        
        virtual void serialize_cfg(odb::iobject& cfg) override {
            if(status_ == status::UNDEFINED){
                writer::prop("energy", std::numeric_limits<double>::quiet_NaN()) >> cfg;
            } else if(status_ == status::DEFINED) {
                writer::prop("energy", energy_) >> cfg;
            } else {
                throw std::runtime_error("Error: Property neither UNDEFINED nor DEFINED!\n");
            }
        }
        
        void set_cfg(double energy){
            energy_ = energy;
        }

    private: // data
        double energy_; ///< result. energy of config
    }; // class property
    
} } }

#endif // WDB_ENTITIES_UEVOL_PROPERTY_HPP
