import commands
wdb_home = '/Users/ethan/src/whiplashdb'

def CommitExecutable(executable):
    args = FormArgs(wdb_home+'/src/apps/drivers/commit_executable.driver',executable)
    return Commit(args)[0]

def CommitModel(model):
    args = FormArgs(wdb_home+'/src/apps/drivers/commit_model.driver',model)
    return Commit(args)[0]

def CommitModels(model, paths):
    args = FormArgs(wdb_home+'/src/apps/drivers/commit_model.driver',model)
    args.append('-path')
    args.append(','.join(paths))
    return Commit(args)

def CommitProperty(property):
    args = FormArgs(wdb_home+'/src/apps/drivers/commit_property.driver',property)
    return Commit(args)[0]

def CommitProperties(property, model_ids, reps):
    args = FormArgs(wdb_home+'/src/apps/drivers/commit_property.driver',property)
    args.append('-reps')
    args.append(str(reps))
    args.append('-model')
    args.append(','.join(model_ids))
    return Commit(args)

def FormArgs(path,entity):
    args = [path]
    for (key,val) in entity.items():
        args.append('-'+key)
        args.append(str(val))
    return args

def Commit(args):
    ids = commands.getoutput(' '.join(args)).split('\n')
    return ids

def Query(filter,target):
    return 0
