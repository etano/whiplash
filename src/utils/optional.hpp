#ifndef WDB_UTILS_OPTIONAL_HPP
#define WDB_UTILS_OPTIONAL_HPP

namespace wdb {

    template<typename T>
    struct helper {
        template<typename... Args>
        helper(Args... args) : value(args...) {}
        helper(){}
        T value;
    };

    template<typename T>
    class optional : public helper<T> {
    public:
        template<typename... Args>
        optional(Args... args) : helper<T>(args...), valid(true) {}
        optional() : valid(false) {}
        operator T (){
            return *(T*)this;
        }
        operator bool (){
            return valid;
        }
        bool valid;
    };

}

#endif
