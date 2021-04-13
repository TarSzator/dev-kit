#!/usr/bin/env bash


HELP_TEXT="
  link <source> <target>   Links a node module to a project. Replaces npm link for docker. Use ./ctrl.sh link instead.
"

operation=$1
serviceName=$2
targetServiceName=$3

case ${operation} in

  link)
    if [[ -z ${targetServiceName} ]]; then
      echo "$ERROR No target service name provided to run setup command: ${operation}"
      exit 1
    fi
    echo "$STEP ... link ${serviceName} into ${targetServiceName} ..."
    # [RS] npm link does not work with build via containers due to docker not following symlinks outside context
    # [RS] (also on a side note: npm link does not work with prefix option)
    moduleName="@sgorg/$(basename ${localPath})"
    nmFolder="${targetLocalPath}/node_modules/${moduleName}"

    if [[ -d ${nmFolder} ]]; then
      if [[ -L ${nmFolder} ]]; then
        clearTarget="rm -f ${nmFolder}"
        echo ${clearTarget}
        eval "${clearTarget}"
        exit_on_error $?
        echo "$STEP ... previous linked module "${moduleName}" removed ..."
      else
        clearTarget="rm -rf ${nmFolder}"
        echo ${clearTarget}
        eval "${clearTarget}"
        exit_on_error $?
        echo "$STEP ... previous installed module "${moduleName}" removed ..."
      fi
    else
      # [RS] Symlinks not pointing to a folder must be removed as well
      if [[ -L ${nmFolder} ]]; then
        clearTarget="rm -f ${nmFolder}"
        eval "${clearTarget}"
        exit_on_error $?
        echo "$STEP ... previous falsely linked module "${moduleName}" removed ..."
      else
        echo "$STEP ... module "${moduleName}" not installed or linked yet ..."
      fi
    fi
    link="ln -s ../../${localPath} ${nmFolder}"
    echo ${link}
    eval "${link}"
    exit_on_error $?
  ;;
esac
