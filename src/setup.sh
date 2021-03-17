#!/usr/bin/env bash


HELP_TEXT="
  undoInit                 Purges everything in context of this project
  help                     Shows this usage instructions.
  unlinkHomeBin            Removes symlink in home bin folder
  purgeCertificate         Removes and un-registers the SSL certificate.
  unregisterCertificate    Un-registers the SSL certificate from the system (only MacOS supported).
  removeCertificate        Removes the SSL certificate.
  link <source> <target>   Links a node module to a project. Replaces npm link for docker. Use ./ctrl.sh link instead.
  purge <service>          Checks if there are not committed or not pushed changes and removes the service folder
"

operation=$1
serviceName=$2
targetServiceName=$3

case ${operation} in
  undoInit)
    echo "$START Uninstalls local development environment ..."
    ./ctrl.sh downAll
    exit_on_error $?
    echo "$STEP ... environment shut down ..."
    "$0" purgeCertificate
    exit_on_error $?
    echo "$STEP ... certificate purged ..."
    "$0" purge game
    exit_on_error $?
    echo "$STEP ... game service purged ..."
    "$0" purge gameClient
    exit_on_error $?
    echo "$STEP ... gameClient service purged ..."
    "$0" purge dbClient
    exit_on_error $?
    echo "$STEP ... dbClient service purged ..."
    "$0" purge gameServer
    exit_on_error $?
    echo "$STEP ... gameServer service purged ..."
    "$0" purge adminServer
    exit_on_error $?
    echo "$STEP ... adminServer service purged ..."
    "$0" purge segmentServer
    exit_on_error $?
    echo "$STEP ... segmentServer service purged ..."
    "$0" purge gisConnector
    exit_on_error $?
    echo "$STEP ... gisConnector service purged ..."
    "$0" purge graphqlCustomTypes
    exit_on_error $?
    echo "$STEP ... graphqlCustomTypes service purged ..."
    "$0" purge logger
    exit_on_error $?
    echo "$STEP ... logger service purged ..."
    "$0" purge messagingClient
    exit_on_error $?
    echo "$STEP ... messagingClient service purged ..."
    "$0" purge insightsClient
    exit_on_error $?
    echo "$STEP ... insightsClient service purged ..."
    "$0" purge insightsGraphqlClient
    exit_on_error $?
    echo "$STEP ... insightsGraphqlClient service purged ..."
    "$0" purge sisConnector
    exit_on_error $?
    echo "$STEP ... sisConnector service purged ..."
    docker-compose down --rmi all -v
    exit_on_error $?
    echo "$STEP ... removed docker images and volumes ..."
    "$0" unlinkHomeBin
    exit_on_error $?
    echo "$STEP ... link local bin removed ..."
    echo "$SUCCESS Initial setup reverted"
    exit 0
  ;;
  unlinkHomeBin)
    binPath=~/bin/gbCtrl
    if [[ -d "${binPath}" ]]; then
      echo "$ERROR '${binPath}' is a folder"
      exit 1
    fi
    if [[ -f "${binPath}" ]]; then
      if [[ -L "${binPath}" ]]; then
        rm -f "${binPath}"
        exit_on_error $?
        echo "$STEP '${binPath}' unlinked"
      else
        echo "$ERROR '${binPath}' is a file and not a symlink"
        exit 1
      fi
    else
      if [[ -L "${binPath}" ]]; then
        rm -f "${binPath}"
        exit_on_error $?
        echo "$STEP '${binPath}' unlinked!"
      else
        echo "$STEP No link at '${binPath}' to unlink"
      fi
    fi
    exit 0
  ;;
  purgeCertificate)
    "$0" checkCertificate
    result=$?
    if [[ ${result} == 2 ]]; then
      echo "$STEP Certificate does not exists. Assuming it was also not registered with the system."
      exit 0
    fi
    if [[ ${result} == 1 ]]; then
      exit_on_error ${result}
    fi
    echo "Un-registering and removing certificate ..."
    read -p "To un-register the certificate with you system we need sudo rights. For that we will request your password. Please acknowledge? [Yn]" -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Nn]$ ]]; then
      echo "$YELLOW""Skipped cert removal. Process done.$DEFAULT"
      exit 1
    fi
    if ! "$0" unregisterCertificate; then
      echo "... certificate was not registered at system. Removing ..."
    else
      echo "... certificate un-registered from system. Removing ..."
    fi
    "$0" removeCertificate
    exit_on_error $?
    echo "$STEP Certificate un-registered and removed"
    exit 0
  ;;
  removeCertificate)
    crtUri="${SSL_CERT_PATH}/${SSL_CERT_NAME}"
    keyUri="${SSL_CERT_PATH}/${SSL_KEY_NAME}"
    if [[ -f ${crtUri} ]]; then
      rm -rf ${crtUri}
      exit_on_error $?
    fi
    if [[ -f ${keyUri} ]]; then
      rm -rf ${keyUri}
      exit_on_error $?
    fi
    exit 0
  ;;
  unregisterCertificate)
    crtUri="${SSL_CERT_PATH}/${SSL_CERT_NAME}"
    sudo security remove-trusted-cert -d ${crtUri}
    exit $?
  ;;
  ''|help)
    echo "${HELP_TEXT}"
    exit 0
  ;;
esac

case ${operation} in
  purge)
    if [[ ! -d ${localPath} ]]; then
      echo "$STEP Service ${serviceName}'s path '${localPath}' does not exist and is considered purged"
      exit 0
    fi
    if [[ -L ${localPath} ]]; then
      echo "$ERROR Service ${serviceName}'s path '${localPath}' is a symlink. Can't be purged by this script."
      exit 1
    fi
    if [[ -f ${localPath} ]]; then
      echo "$ERROR Service ${serviceName}'s path '${localPath}' is a file. Can't be purged by this script."
      exit 1
    fi
    currentFolder=$(pwd)
    exit_on_error $?
    cd ${localPath}
    exit_on_error $?
    status=$(git status --porcelain)
    exit_on_error $?
    if [[ ! -z "${status}" ]]; then
      echo "$ERROR There are not committed changes in service '${serviceName}' path '${localPath}'"
      exit 1
    fi
    status=$(git status)
    exit_on_error $?
    if [[ ${status} == *"Your branch is ahead"* ]]; then
      echo "$ERROR There are not pushed commits in service '${serviceName}' path '${localPath}'"
      exit 1
    fi
    cd ${currentFolder}
    read -p "Are you sure to purged service '${serviceName}' by removing folder '${localPath}' [yN]" -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      echo "Purging service '${serviceName}' ..."
      rm -rf ${localPath}
      exit_on_error $?
      echo "$STEP service '${serviceName}' purged"
    else
      echo "$STEP skipped purge of service '${serviceName}'"
    fi
    exit 0
  ;;
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
  *)
    echo "${HELP_TEXT}"
    echo "$ERROR Unknown operation '$operation'"
    exit 1
  ;;
esac
