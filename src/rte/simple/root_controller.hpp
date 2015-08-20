#ifndef WDB_RTE_SIMPLE_ROOT_CONTROLLER_HPP
#define WDB_RTE_SIMPLE_ROOT_CONTROLLER_HPP

namespace wdb { namespace rte { namespace simple {

    class root_controller : public iroot_controller {
    public:
        virtual ~root_controller() override {}

        root_controller(ipool& p) : pool(p) {}

        virtual void add_controller(icontroller_delegate& ctrl) override {
            controllers.push_back(make_pair(&ctrl,std::vector<int>()));
        }

        virtual void declare_segue(icontroller_delegate& src, icontroller_delegate& dst) override {
            int first = position(src);
            int second = position(dst);
            controllers[first].second.push_back(second);
        }

        virtual void yield() override {
            for(int i = 0; i < controllers.size(); i++){
                segue(i); for(auto& obj : pool.pull())
                    delegate->resolve(*obj, pool);
            }
        }

        int position(icontroller_delegate& ctrl) const {
            auto iter = controllers.begin();
            while(iter != controllers.end()){
                if((*iter).first == &ctrl) break;
                iter++;
            }
            if(iter == controllers.end()) throw std::runtime_error( "Error: unknown controller" );
            return std::distance(controllers.begin(), iter);
        }

        void segue(int c){
            this->delegate = controllers[c].first;
            this->segues = controllers[c].second;
            printf("Controller %d: ", c); for(auto& s : controllers[c].second) printf("%d ", s);
            printf("\n");
        }

        void print_segues() const {
            int i = 0;
            for(auto& c : controllers){
                printf("Controller %d: ", i); for(auto& s : c.second) printf("%d ", s);
                printf("\n");
                i++;
            }
        }
    private:
        std::vector<std::pair<icontroller_delegate*,std::vector<int>>> controllers;
        icontroller_delegate* delegate;
        std::vector<int> segues;
        ipool& pool;
    };

} } }

#endif
