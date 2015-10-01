import sys
import whiplashdb

# Connect to database
wdb = whiplashdb.wdb("localhost:27017","test","test")

# Commit model
print wdb.CommitExecutable(sys.argv[1])
