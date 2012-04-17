#!/bin/sh
#
# Thanks to 
#
# <http://codeinthehole.com/writing/tips-for-using-a-git-pre-commit-hook/> 
# 
# for the stash logic so that we actually lint what is being committed
# rather than what happens to be in the working directory.

git stash -q --keep-index

make jshint
RESULT=$?

git stash pop -q
[ $RESULT -ne 0 ] && exit 1
exit 0
