#ifndef OPTIONS_HPP
#define OPTIONS_HPP

#include <iostream>
#include <map>
#include <string>
#include <iterator>

template <typename T>
class opt {
private:
  struct bool_conv { int dummy; };
public:
  opt() : initialized(false) { }
  opt(const T& data) : initialized(true), data(data) {}

  T& operator*()
  {
    return data;
  }

  const T& operator*() const
  {
    return data;
  }

  T* operator->()
  {
    return &data;
  }

  const T* operator->() const
  {
    return &data;
  }

  // ugly conversion to bool
  operator int bool_conv::* () const
  {
    return initialized ? &bool_conv::dummy : 0;
  }
private:
  bool initialized;
  T data;
};

typedef std::map<std::string, std::string> amap_type;

inline amap_type parse_args(int argc, char *argv[])
{
  // note: negative numbers cannot be parsed

  amap_type args;

  bool have_key = false;
  std::string key;
  for (std::size_t i = 1; i < std::size_t(argc); ++i) {
    if (argv[i][0] == '-') {
      if (have_key)
        args[key] = "1";
      else
        have_key = true;
      key = argv[i] + 1;
    } else if (have_key) {
      args[key] = argv[i];
      have_key = false;
    }
  }

  if (have_key) args[key] = "1";

  return args;
}

inline opt<std::string> get_sarg(const amap_type& args, const std::string& o)
{
  amap_type::const_iterator it = args.find(o);
  if (it == args.end()) return opt<std::string>();

  return opt<std::string>(it->second);
}

inline opt<std::string> get_sarg(const amap_type& args, const std::string& o, const std::string& def)
{
  amap_type::const_iterator it = args.find(o);
  if (it == args.end()) return opt<std::string>(def);

  return opt<std::string>(it->second);
}

inline opt<int> get_iarg(const amap_type& args, const std::string& o)
{
  amap_type::const_iterator it = args.find(o);
  if (it == args.end()) return opt<int>();

  return opt<int>(std::atoi(it->second.c_str()));
}

inline opt<int> get_iarg(const amap_type& args, const std::string& o, int def)
{
  amap_type::const_iterator it = args.find(o);
  if (it == args.end()) return opt<int>(def);

  return opt<int>(std::atoi(it->second.c_str()));
}

inline opt<unsigned> get_uarg(const amap_type& args, const std::string& o)
{
  amap_type::const_iterator it = args.find(o);
  if (it == args.end()) return opt<unsigned>();

  return opt<unsigned>(std::atoi(it->second.c_str()));
}

inline opt<unsigned> get_uarg(const amap_type& args, const std::string& o, unsigned def)
{
  amap_type::const_iterator it = args.find(o);
  if (it == args.end()) return opt<unsigned>(def);

  return opt<unsigned>(std::atoi(it->second.c_str()));
}

inline opt<double> get_darg(const amap_type& args, const std::string& o)
{
  amap_type::const_iterator it = args.find(o);
  if (it == args.end()) return opt<double>();

  return opt<double>(std::atof(it->second.c_str()));
}

inline opt<double> get_darg(const amap_type& args, const std::string& o, double def)
{
  amap_type::const_iterator it = args.find(o);
  if (it == args.end()) return opt<double>(def);

  return opt<double>(std::atof(it->second.c_str()));
}

#endif
