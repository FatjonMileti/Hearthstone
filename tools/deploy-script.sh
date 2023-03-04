#!/bin/bash

#
# This script runs start.sh if needed (project needs updating)
#

. $HOME/.bashrc
WORKING_PATH="$(dirname $( dirname  $(readlink -f "${BASH_SOURCE}")  ))"
. $WORKING_PATH/.env
FLAG=$WORKING_PATH/../backend-flag

if [ -f $FLAG ]; then
  echo deploy already in progress
  exit 1
fi

cd $WORKING_PATH
git fetch
LOCAL_COMMIT=$(git rev-parse HEAD)
REMOTE_COMMIT=$(git rev-parse @{u})
echo local commit - $LOCAL_COMMIT
echo remote commit - $REMOTE_COMMIT

if [ "$LOCAL_COMMIT" = "$REMOTE_COMMIT" ]; then
  echo no need to update
else
  git pull
  bash $WORKING_PATH/client/tools/start.sh
  bash $WORKING_PATH/server/tools/start.sh
fi
