#ifndef SIMFW_ODB_MONGO_PROP_READER_HPP
#define SIMFW_ODB_MONGO_PROP_READER_HPP

namespace simfw { namespace odb { namespace mongo {

    namespace detail {
        using object_view = bsoncxx::v0::document::view;
        using array_view = bsoncxx::v0::array::view;
        using element = bsoncxx::v0::array::element;

        template<typename T>
        const T get(object_view doc, std::string field){
            printf("Error: unknown type\n");
        }

        template<>
        const double get<double>(object_view doc, std::string field){
            return (double)doc[field].get_double();
        }

        template<>
        const int get<int>(object_view doc, std::string field){
            return (int)doc[field].get_int32();
        }

        template<>
        const array_view get<array_view>(object_view doc, std::string field){
            return (array_view)doc[field].get_array();
        }

        template<typename T>
        const T get(const element& e){
            printf("Error: unknown type\n");
        }

        template<>
        const int get<int>(const element& e){
            return (int)e.get_int32();
        }

        template<>
        const double get<double>(const element& e){
            return (double)e.get_double();
        }

        template<>
        const array_view get(const element& e){
            return (array_view)e.get_array();
        }
    }

    class prop_reader {
    public:
        static void make_hamil(const object& obj){
            typedef std::pair<std::vector<int>, double> edge_type;
            typedef std::vector<int> node_type;

            std::vector<edge_type> edges_;
            std::vector<node_type> nodes_;
            int N_ = 0;

            for(auto&& edge : detail::get<detail::array_view>(obj.view, "config")){
                printf("[\n");
                std::vector<int> inds;
                printf("[\n");

                auto& sub_array = detail::get<detail::array_view>(edge);
                for( const auto a : detail::get<detail::array_view>(sub_array[0]) ){
                    int a_ = detail::get<int>(a);
                    N_ = std::max(N_, a_);
                    inds.push_back(a_);
                    printf("%d\n", inds.back());
                }
                printf("],\n");
                double val = detail::get<double>(sub_array[1]);
                std::cout << val << "\n";
                edges_.push_back(std::make_pair(inds, val));
                printf("]\n");
            }

            nodes_.resize(N_+1);
            for(int j = 0; j < edges_.size(); ++j)
                for(const auto a : edges_[j].first)
                    nodes_[a].push_back(j);
        }
    };

} } }

#endif

