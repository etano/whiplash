#ifndef SIMFW_DEPLOYMENT_H693_HPP
#define SIMFW_DEPLOYMENT_H693_HPP

namespace simfw { namespace deployment {

    h693::h693(odb::iobjectdb& db)
        : db(db),
        instances( db.provide_collection("instances") ),
        hamiltonians( db.provide_collection("hamiltonians") )
    {
    }

    void h693::insert_instance(int hid, std::string solver, const std::vector<std::string>& params){
            using bsoncxx::builder::basic::document;
            using bsoncxx::builder::basic::kvp;
            using bsoncxx::builder::basic::sub_document;
            using bsoncxx::builder::basic::sub_array;

            auto entry = document{};
            entry.append(
                 kvp("hid", hid),
                 kvp("solver", solver),
                 kvp("params", [&params](sub_array subarr){
                     for(auto i : params) subarr.append(i);
                 }),
                 kvp("state", [](sub_document subdoc){
                     subdoc.append(kvp("config", [](sub_array subarr){ subarr.append(std::numeric_limits<double>::quiet_NaN()); }));
                     subdoc.append(kvp("cost", std::numeric_limits<double>::quiet_NaN()));
                 })
            );
            dynamic_cast<simfw::odb::mongo::collection&>(instances).insert(entry);
    }

    void h693::insert_hamil(std::ifstream& in){
            using bsoncxx::builder::basic::document;
            using bsoncxx::builder::basic::kvp;
            using bsoncxx::builder::basic::sub_document;
            using bsoncxx::builder::basic::sub_array;

            auto entry = document{};
            entry.append(
                 kvp("_id", db.get_next_id("hamiltonians")),
                 kvp("config", [&in](sub_array subarr){
                    std::size_t N(0);
                    std::map<std::string,int> index;
                    while(in){
                        std::string input_str;
                        if(!std::getline(in,input_str)) break;
                    
                        if(input_str.find(' ') != std::string::npos && input_str.find('#') == std::string::npos){
                            std::istringstream tmp0(input_str);
                            std::vector<std::string> input;
                            while(tmp0){
                                std::string s;
                                if(!std::getline(tmp0, s, ' ')) break;
                                input.push_back(s);
                            }
                    
                            double val(std::stod(input[input.size()-1]));
                    
                            std::vector<int> edge_inds;
                            for(int i = 0; i < input.size()-1; ++i){
                                const std::string site(input[i]);
                                if(index.find(site) == index.end())
                                  index[site] = N++;
                                edge_inds.push_back(index[site]);
                            }
                            std::sort(edge_inds.begin(),edge_inds.end(),std::less<int>());
            
                            subarr.append([&edge_inds,val](sub_array pair){
                                pair.append([&edge_inds](sub_array e){
                                    for(int a : edge_inds)
                                        e.append(a);
                                });
                                pair.append(val);
                            });
                        }
                    }
                 })
            );

            std::cout << bsoncxx::to_json(entry) << std::endl;
            dynamic_cast<simfw::odb::mongo::collection&>(hamiltonians).insert(entry);
    }

    void h693::list_instances(){
        instances.list_objects();
    }

    void h693::list_hamil(int id){
        hamiltonians.find_object(id);
    }

    rte::iexecutable& h693::load(std::string app){
        static rte::cluster::executable inst(app);
        return inst;
    }

} }

#endif
