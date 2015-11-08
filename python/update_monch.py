#!/usr/bin/env python3

import subprocess as sp

for FILE in ["whiplash.py","scheduler_local.py"]:
    sp.call("scp " + FILE + " " + "whiplash@monch.cscs.ch:rte/",shell=True)
