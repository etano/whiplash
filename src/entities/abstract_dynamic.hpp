#ifndef SIMFW_ENTITIES_ABSTRACT_DYNAMIC_HPP
#define SIMFW_ENTITIES_ABSTRACT_DYNAMIC_HPP

namespace simfw { namespace types {

    class abstract_dynamic_problem : public abstract_problem {
    public:
        virtual ~abstract_dynamic_problem(){}

        class dynamic_properties_reader {

        };
        class dynamic_properties_cache {

        };
    };

} }

#endif
