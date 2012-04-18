#!/bin/sh
#
# Thanks to 
#
# <http://codeinthehole.com/writing/tips-for-using-a-git-pre-commit-hook/> 
# 
# for the stash logic so that we actually lint what is being committed
# rather than what happens to be in the working directory.

git stash -q --keep-index

echo "Running jshint; the commit will be allowed even if there are errors."
echo "Please commit appropriate fixes before making a pull request."

make jshint

git stash pop -q

exit 0
