from subprocess import Popen, PIPE
wdb_home = '/Users/ethan/src/whiplashdb'

def FormArgs(path,entity):
    args = [path]
    for (key,val) in entity.items():
        args.append('-'+key)
        args.append(str(val))
    return args

def Execute(args):
    p = Popen(args,stdout=PIPE,stderr=PIPE,bufsize=1)
    (stdout, stderr) = p.communicate()
    res = [x for x in stdout.split('\n') if x]
    return res

def CommitExecutable(executable):
    args = FormArgs(wdb_home+'/src/apps/drivers/commit_executable.driver',executable)
    return Execute(args)[0]

def CommitModel(model):
    args = FormArgs(wdb_home+'/src/apps/drivers/commit_model.driver',model)
    return Execute(args)[0]

def CommitModels(model, paths):
    model['path'] = ','.join(paths)
    args = FormArgs(wdb_home+'/src/apps/drivers/commit_model.driver',model)
    return Execute(args)

def CommitProperty(property):
    args = FormArgs(wdb_home+'/src/apps/drivers/commit_property.driver',property)
    return Execute(args)[0]

def CommitProperties(property, model_ids, reps):
    property['reps'] = reps
    property['model'] = ','.join(model_ids)
    args = FormArgs(wdb_home+'/src/apps/drivers/commit_property.driver',property)
    return Execute(args)

def Query(filter,target):
    filter['target'] = target
    args = FormArgs(wdb_home+'/src/apps/drivers/query.driver',filter)
    return Execute(args)
