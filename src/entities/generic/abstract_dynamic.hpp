#ifndef WDB_ENTITIES_GENERIC_ABSTRACT_DYNAMIC_HPP
#define WDB_ENTITIES_GENERIC_ABSTRACT_DYNAMIC_HPP

namespace wdb { namespace entities {

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
