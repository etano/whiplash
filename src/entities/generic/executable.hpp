#ifndef WDB_ENTITIES_GENERIC_EXECUTABLE_HPP
#define WDB_ENTITIES_GENERIC_EXECUTABLE_HPP

namespace wdb { namespace entities {

    class executable : public wdb::rte::icacheable {
    public:
        template<class I>
        executable(I info, std::string path, std::string desc, std::string algo, std::string version, std::string build_info, optional<parameters> params){
            class_ = I::name;
            path_ = path;
            description_ = desc;
            algorithm_ = algo;
            version_ = version;
            build_info_ = build_info;
            params_ = params;
            app_ = new rte::app(path_);
        }

        executable(const odb::iobject& o){
            class_ = reader::read<std::string>(o, "class");
            path_ = reader::read<std::string>(o, "path");
            description_ = reader::read<std::string>(o, "description");
            algorithm_ = reader::read<std::string>(o, "algorithm");
            version_ = reader::read<std::string>(o, "version");
            build_info_ = reader::read<std::string>(o, "build_info");
            params_ = reader::read<parameters>(o, "cfg");
            app_ = new rte::app(path_);
        }

        virtual ~executable() {
            delete app_;
        };

        virtual void operator()(int argc, char** argv){
            (*app_)(argc, argv);
        }

        virtual void serialize_cfg(odb::iobject& cfg) {}

        virtual void serialize(odb::iobject& record, odb::iobject& cfg){
            writer::prop("path", path_) >> record;
            writer::prop("class", class_) >> record;
            writer::prop("description", description_) >> record;
            writer::prop("algorithm", algorithm_) >> record;
            writer::prop("version", version_) >> record;
            writer::prop("build_info", build_info_) >> record;
            if(params_)
                if(params_.unwrap().get_container())
                    writer::prop("cfg", params_) >> record;
        }

        std::string get_class(){ return class_; }
    protected:
        std::string class_;
        std::string path_;
        std::string description_;
        std::string algorithm_;
        std::string version_;
        std::string build_info_;
        optional<parameters> params_;
        rte::iapp* app_;
    };

} }

#endif
