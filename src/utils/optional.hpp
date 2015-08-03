#ifndef WDB_UTILS_OPTIONAL_HPP
#define WDB_UTILS_OPTIONAL_HPP

namespace wdb {

    template<typename T>
    class optional {
    public:
        template<typename... Args>
        optional(Args... args) : value(args...), valid(true) {}
        optional() : valid(false) {}
        operator T () const {
            return *(T*)this;
        }
        explicit operator bool (){
            return valid;
        }
        const optional& operator || (const optional& b) const {
            if(valid) return *this;
            return b;
        }
        T value;
        bool valid;
    };

}

#endif
