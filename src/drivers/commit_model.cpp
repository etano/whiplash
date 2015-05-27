#include "wdb.hpp"
#include "options.hpp"

using wdb::odb::mongo::objectdb;

int main(int argc, char* argv[])
{
    objectdb db("cwave.ethz.ch:27017");
    wdb::deployment::basic sf(db);

    const amap_type args(parse_args(argc, argv));
    const std::string file(*get_sarg(args, "file"));
    const std::vector<std::pair<std::string,std::string> > descriptor{
      std::make_pair("class",*get_sarg(args, "class"))
        , std::make_pair("description",*get_sarg(args, "description"))
        , std::make_pair("owner",*get_sarg(args, "owner"))
        };
    
    std::cout << "file: " << file << std::endl;
    for(const auto& desc : descriptor)
      std::cout << desc.first << " --> " << desc.second << std::endl;

    std::ifstream in(file); //apps/hamil
    sf.insert_model(in,descriptor);
    in.close();

    return 0;
}
