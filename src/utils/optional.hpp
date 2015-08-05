#ifndef WDB_UTILS_OPTIONAL_HPP
#define WDB_UTILS_OPTIONAL_HPP
#include <utility>
#include <functional>
#include <type_traits>

namespace wdb {

    template<typename T>
    class optional {
    public:
        template <typename Func, typename = typename std::enable_if<std::is_convertible<Func, std::function<T()>>::value>::type>
        optional(Func f) : func(f), valid(false) {}
        template<typename... Args>
        optional(Args... args) : value(args...), valid(true) {}
        optional() : valid(false) {}
        operator T () { // (was for icc initially)
            if(func){ value = func(); valid = true; }
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
        T unwrap() const {
            return *(T*)this;
        }
        bool is_null(){
            return !valid;
        }
    private:
        T value;
        bool valid;
        std::function<T()> func;
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
        bool&& unwrap() const {
            return std::move(*(bool*)this);
        }
        bool is_null(){
            return !valid;
        }
    private:
        bool value;
        bool valid;
    };

}

#endif
