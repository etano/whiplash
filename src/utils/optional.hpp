#ifndef WDB_UTILS_OPTIONAL_HPP
#define WDB_UTILS_OPTIONAL_HPP
#include <utility>
#include <functional>
#include <type_traits>
#include <execinfo.h>

inline void trace(){

    void* b[15]; backtrace_symbols_fd(b,backtrace(b,15),2);

}


namespace wdb {

    template<typename R>
    class optional_expr;

    template<typename T>
    class optional {
    public:
        friend optional_expr<T>;

        template <typename Arg, typename = typename std::enable_if<!std::is_convertible<Arg, std::function<T()>>::value>::type>
        optional(Arg arg) : value(arg), valid(true) {}

        template<typename Arg, typename... Other, typename = typename std::enable_if<!std::is_convertible<Arg, std::function<T()>>::value>::type>
        optional(Arg arg, Other... other) : value(arg, other...), valid(true) {}

        optional() : valid(false) {}
        operator T () {
            if(!valid){ std::cerr << "ERROR: unwrapping empty optional value" << std::endl; trace(); exit(1); }
            return *(T*)this;
        }
        operator T () const {
            if(!valid){ std::cerr << "ERROR: unwrapping empty optional const value" << std::endl; exit(1); }
            return *(T*)this;
        }
        explicit operator bool (){
            return valid;
        }
        optional operator || (const T& b) const {
            if(valid) return *this;
            return b;
        }
        optional operator || (const optional& b) const {
            if(valid) return *this;
            return b;
        }
        optional_expr<T> operator || (const optional_expr<T>& b) const {
            if(valid) return *this;
            return b;
        }
        T unwrap() const {
            if(!valid){ std::cerr << "ERROR: unwrapping empty optional value" << std::endl; exit(1); }
            return *(T*)this;
        }
        bool is_null(){
            return !valid;
        }
    private:
        T value;
        bool valid;
    };

    template<typename R>
    class optional_expr : private optional<R> {
    public:
        template <typename Func, typename = typename std::enable_if<std::is_convertible<Func, std::function<R()>>::value>::type>
        optional_expr(Func f) : func(f) {}

        optional_expr(const optional<R>& r){ this->value = r.value; this->valid = r.valid; }

        operator R (){
            if(func){ this->value = func(); this->valid = true; }
            if(!this->valid){ std::cerr << "ERROR: unwrapping empty optional value" << std::endl; exit(1); }
            return *(R*)this;
        }
    private:
        std::function<R()> func;
    };

    template<>
    class optional<bool> {
    public:
        friend optional_expr<bool>;
        optional(bool arg) : value(arg), valid(true) {}
        optional() : valid(false) {}

        operator bool&& () const {
            if(!valid){ std::cerr << "ERROR: unwrapping empty optional value" << std::endl; exit(1); }
            return std::move(*(bool*)this);
        }
        explicit operator bool&& (){
            return std::move(valid);
        }
        explicit operator bool () const = delete;

        optional operator || (const bool& b) const {
            if(valid) return *this;
            return b;
        }
        optional operator || (const optional& b) const {
            if(valid) return *this;
            return b;
        }
        optional_expr<bool> operator || (const optional_expr<bool>& b) const {
            if(valid) return *this;
            return b;
        }
        bool&& unwrap() const {
            if(!valid){ std::cerr << "ERROR: unwrapping empty optional value" << std::endl; exit(1); }
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
