#ifndef WDB_RTE_SLURM_ROOT_CONTROLLER_HPP
#define WDB_RTE_SLURM_ROOT_CONTROLLER_HPP

namespace wdb { namespace rte { namespace slurm {

    class root_controller : public iroot_controller {
    public:
        virtual ~root_controller() override {}

        virtual void add_controller(icontroller_delegate& ctrl) override {
            controllers.push_back(make_pair(&ctrl,std::vector<int>()));
        }

        virtual void declare_segue(icontroller_delegate& src, icontroller_delegate& dst) override {
            int first = position(src);
            int second = position(dst);
            controllers[first].second.push_back(second);
        }

        virtual void yield() override {
            //for(;;){
                //query_jobs();
                for(int i = 0; i < controllers.size(); i++){
                    focus(i); // FIXME: This should be called segue
                    // request workload
                    // child->resolve();
                    // check if segues
                }
            //}
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

        void focus(int c){
            this->child = controllers[c].first;
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
        icontroller_delegate* child;
        std::vector<int> segues;
    };

} } }

#endif
