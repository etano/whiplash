from subprocess import Popen, PIPE

# WhiplashDB class
class wdb:
    def __init__(self,wdb_home):
        self.wdb_home = wdb_home

    def FormArgs(self,path,entity):
        args = [path]
        for (key,val) in entity.items():
            args.append('-'+key)
            args.append(str(val))
        return args

    def Execute(self,args):
        p = Popen(args,stdout=PIPE,stderr=PIPE,bufsize=1)
        (stdout, stderr) = p.communicate()
        res = [x for x in stdout.split('\n') if x]
        return res

    def CommitExecutable(self,executable):
        args = self.FormArgs(self.wdb_home+'/bin/commit_executable.driver',executable)
        return self.Execute(args)[0]

    def CommitModel(self,model):
        args = self.FormArgs(self.wdb_home+'/bin/commit_model.driver',model)
        return self.Execute(args)[0]

    def CommitModels(self,model,paths):
        model['path'] = ','.join(paths)
        args = self.FormArgs(self.wdb_home+'/bin/commit_model.driver',model)
        return self.Execute(args)

    def CommitProperty(self,property):
        args = self.FormArgs(self.wdb_home+'/bin/commit_property.driver',property)
        return self.Execute(args)[0]

    def CommitProperties(self,property,model_ids,reps):
        property['reps'] = reps
        property['model'] = ','.join(model_ids)
        args = self.FormArgs(self.wdb_home+'/bin/commit_property.driver',property)
        return self.Execute(args)

    def Query(self,filter,target):
        filter['target'] = ','.join(target)
        args = self.FormArgs(self.wdb_home+'/bin/query.driver',filter)
        return self.Execute(args)
