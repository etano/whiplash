#ifndef WDB_UTILS_OPTIONAL_HPP
#define WDB_UTILS_OPTIONAL_HPP

namespace wdb {

    template<typename T>
    class optional {
    public:
        template<typename... Args>
        optional(Args... args) : value(args...), valid(true) {}
        optional() : valid(false) {}
        operator T () { // for icc only
            return *(T*)this;
        }
        operator T () const {
            return *(T*)this;
        }
        explicit operator bool (){
            return valid;
        }
        optional operator || (const optional& b) const {
            if(valid) return *this;
            return b;
        }
        T value;
        bool valid;
    };

    template<>
    class optional<bool> {
    public:
        template<typename... Args>
        optional(Args... args) : value(args...), valid(true) {}
        optional() : valid(false) {}

        operator bool&& () const {
            return std::move(*(bool*)this);
        }
        explicit operator bool&& (){
            return std::move(valid);
        }
        explicit operator bool () const = delete;

        optional operator || (const optional& b) const {
            if(valid) return *this;
            return b;
        }
        bool value;
        bool valid;
    };

}

#endif
