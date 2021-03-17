#!/usr/bin/env bash

MAIN_SERVICES="gameServer, adminServer, segmentServer, gameServer-prod, adminServer-prod, segmentServer-prod"
LINK_SOURCES="dbClient, gisConnector, logger, messagingClient, insightsClient, insightsGraphqlClient, graphqlCustomTypes, gameClient, sisConnector, sisClient"
LINK_TARGETS="gameServer, adminServer, segmentServer, messagingClient, insightsClient, insightsGraphqlClient, gisConnector, dbClient, game, sisConnector"
NODE_SERVICES="$MAIN_SERVICES, dbClient, gameClient, game, gisConnector, logger, messagingClient, graphqlCustomTypes, insightsClient, insightsGraphqlClient, sisConnector, sisClient"

HELP_TEXT="
$GREEN
Usage:$DEFAULT $(basename $0) COMMAND [ARGUMENTS]

Control script for Game Backend

$GREEN""Commands:$DEFAULT

  uninstall                  Removes the local development environment for Game Backend.
  open <service>             Opens the specified service. Main start command. Supports services 'game' and 'adminServer'.
  pull                       Pull the newest version of the required containers.
  install <service>          Run 'npm install' in container so binaries are compiled for the right environment.
  hardUpdate <service>       Run 'npm run hardUpdate' in container so binaries are compiled for the right environment.
  up|start <service>         Starts the specified service and it's requirements.
  down|stop <service>        Stops the specified service and it's requirements that are no longer needed.
  downAll                    Stops all service.
  purge                      Purges everything docker related of Game Backend.
  buildLiveGame              Build the game to connect to the live game server.
  buildLocalGame             Build the game to connect to the local game server.
  restart <service>          Restarts the service and tails the log.
  build <service>            Executes the build script for the specified service.
  logs <service>             Show logs for a specific service.
  tail <service>             Tails logs for a specific service.
  login <service>            SSH login to service.
  testProduction <service>   Tests if the latest image in GitLab of the service is working.
  ps                         Shows docker process list for this project.
  resetCert                  Resetting the certificate if there are any issues
  dbMigrate                  Runs db migration on db container.
  dbSeed                     Runs db seeding on db container.
  debugProxy                 Restarts the proxy container and tails the log.
  link <source> <target>     Links a node module to a project. Replaces npm link for docker.
  help                       Shows this usage instructions.
$YELLOW""Commands for internal use. Use with caution:$DEFAULT
  upRequirements             Starts all containers requirement containers.
  healthcheck <service>      Checks if a specified service is running and healthy.
  run <service>              Starts the service if it is not already running.
  stopIfNotNeeded <service>  Stops a service if it is running and no longer needed.
  stopIfRunning <service>    Stops a service if it is running.
  buildGame <GBC_HOST>       Build the game to connect to the specified host.
"

case "$1" in
  uninstall)
    ./setup.sh undoInit
    exit $?
  ;;
  resetCert)
    ./setup.sh purgeCertificate
    exit_on_error $?
    ./setup.sh prepareCertificate
    exit_on_error $?
    echo "$SUCCESS Cert reset."
    exit 0
  ;;
  pull)
    docker-compose pull redis rabbitmq db proxy gameServer
    exit_on_error $?
    echo "$SUCCESS Pulled  requirements."
    exit 0
  ;;
  downAll)
    docker-compose down
    exit_on_error $?
    echo "$SUCCESS All down."
    exit 0
  ;;
  purge)
    read -p "Do you really want to remove everything docker related to this project? [yN]" -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      docker-compose down -v --rmi all
      exit_on_error $?
      echo "$SUCCESS Everything purged."
    else
      echo "$YELLOW""Purge canceled"
    fi
    exit 0
  ;;
  upRequirements)
    "$0" run db
    "$0" run redis
    "$0" run rabbitmq
    ./setup.sh check game
    "$0" run proxy
    "$0" healthcheck db
    exit_on_error $?
    exit 0
  ;;
  debugProxy)
    docker-compose rm -sf proxy
    exit_on_error $?
    "$0" run proxy
    exit_on_error $?
    "$0" tail proxy
    exit 0
  ;;
  ps)
    docker-compose ps
    exit 0
  ;;
  dbMigrate)
    "$0" run db
    exit_on_error $?
    "$0" healthcheck db
    exit_on_error $?
    echo "Running db migration ..."
    docker-compose run --rm dbClient npm --prefix /app/dbClient run migrate
    exit_on_error $?
    echo "$SUCCESS ... migration done."
    exit 0
  ;;
  dbSeed)
    "$0" run db
    exit_on_error $?
    "$0" healthcheck db
    exit_on_error $?
    echo "Running db seeding ..."
    docker-compose run --rm dbClient npm --prefix /app/dbClient run seed
    exit_on_error $?
    echo "$SUCCESS ... seeding done."
    exit 0
  ;;
  buildLiveGame)
    echo "$START Running live game build process ..."
    "$0" buildGame "$GAME_CLIENT_LIVE_HOST" "$GAME_CLIENT_BOT_LIVE_HOST"
    exit_on_error $?
    echo "$SUCCESS ... live game build done."
    exit 0
  ;;
  buildLocalGame)
    echo "$START Running local game build process ..."
    "$0" buildGame "$GB_HOST:$GAME_SERVER_EXTERNAL_PORT" "$GAME_CLIENT_BOT_LIVE_HOST"
    exit_on_error $?
    echo "$SUCCESS ... local game build done."
    exit 0
  ;;
  buildGame)
    echo "$STEP ... setting GBC_HOST for game-backend-client ..."
    GBC_HOST=$2
    BS_HOST=$3
    echo "GBC_HOST set to: $GBC_HOST"
    echo "BS_HOST set to: $BS_HOST"
    echo "$STEP ... building GB Client for GB ..."
    docker-compose run --rm -e GBC_HOST=${GBC_HOST} -e BS_HOST=${BS_HOST} gameClient npm --prefix /app/gameClient run build
    exit_on_error $?
    echo "$STEP ... link game-backend-client into gb-test-game node_modules ..."
    "$0" link gameClient game
    exit_on_error $?
    echo "$STEP ... building game with local GB Client ..."
    docker-compose run --rm game npm --prefix /app/game run build
    exit_on_error $?
    exit 0
  ;;
  ''|help)
    # Shows help instructions
    echo "${HELP_TEXT}"
    exit 0
  ;;
esac

if [[ -z $2 ]]; then
  echo "${HELP_TEXT}"
  echo "$ERROR No service name provided to run command: '$1'"
  exit 1
fi

case "$1" in
  healthcheck)
    # Spin up db container and wait for it to be ready
    MSG="Waiting for $2 to become ready ..."
    LOOP=0
    echo "$MSG"
    while ! docker-compose ps | grep $2 | grep "(healthy)" > /dev/null 2>&1; do
      sleep 1
      LOOP=$(( LOOP+1 ))
      if [[ "$LOOP" -gt 60 ]]; then
        echo "$ERROR $2 did not became healthy."
        exit 1
      fi
    done
    echo "$GREEN""... $2 is healthy.$DEFAULT"
    exit 0
  ;;
  run)
    if [[ ! -z $(docker-compose ps | grep "$2") ]]; then
      echo "$GREEN""$2 is already running$DEFAULT"
    else
      docker-compose up -d $2
      exit_on_error $?
    fi
    exit 0
  ;;
  stopIfNotNeeded)
    DEPENDENT_CONTAINERS=$(docker ps -f "label=com.softgames.sbs.gb.depends.$2" --format "{{.Names}}")
    if [[ ! -z ${DEPENDENT_CONTAINERS} ]]; then
      echo "$YELLOW""$2 is still required by: ${DEPENDENT_CONTAINERS/$'\n'/', '}$DEFAULT"
    else
      "$0" stopIfRunning $2
      exit_on_error $?
    fi
    exit 0
  ;;
  stopIfRunning)
    if [[ -z $(docker-compose ps -q $2) ]]; then
      echo "$GREEN""Service $2 already stopped$DEFAULT"
    else
      docker-compose stop -t 30 $2
      echo "$STEP $2 stopped"
      docker-compose rm -sf $2
      echo "$STEP $2 removed"
      exit_on_error $?
    fi
    exit 0
  ;;
  login)
    docker-compose exec "$2" /bin/sh
    exit 0
  ;;
  logs)
    docker-compose logs "$2"
    exit 0
  ;;
  tail)
    docker-compose logs -f "$2"
    exit 0
  ;;
esac

if [[ ! ${NODE_SERVICES} =~ (^|[[:space:]])$2($|\,) ]]; then
  echo "$ERROR Provided service '$2' not in node service list: ${NODE_SERVICES}"
  exit 1
fi

case "$1" in
  install)
    ./setup.sh check $2
    exit_on_error $?
    echo "Installing node_modules for $2 ..."
    docker-compose run --rm $2 npm --prefix /app/$2 install
    exit_on_error $?
    echo "$SUCCESS ... installing node_modules for $2 done."
    exit 0
  ;;
  hardUpdate)
    ./setup.sh check $2
    exit_on_error $?
    echo "Hard updating node_modules for $2 ..."
    docker-compose run --rm $2 npm --prefix /app/$2 run hardUpdate
    exit_on_error $?
    echo "$SUCCESS ... hard update of node_modules for $2 done."
    exit 0
  ;;
  build)
    ./setup.sh check $2
    exit_on_error $?
    echo "Building $2 ..."
    docker-compose run --rm $2 npm --prefix /app/$2 run build
    exit_on_error $?
    echo "$SUCCESS ... build of $2 done."
    exit 0
  ;;
  open)
    case "$2" in
      adminServer)
        "$0" up $2
        exit_on_error $?
        "$0" healthcheck $2
        exit_on_error $?
        open "https://$GB_HOST:$ADMIN_SERVER_EXTERNAL_PORT/graphqlAdmin"
        "$0" tail "$2"
      ;;
      game)
        "$0" up gameServer
        exit_on_error $?
        "$0" healthcheck proxy
        exit_on_error $?
        "$0" healthcheck gameServer
        exit_on_error $?
        open "https://www.facebook.com/embed/instantgames/$GAME_FB_APP_ID/player?game_url=https://$GB_HOST:$GAME_EXTERNAL_PORT"
        "$0" tail gameServer
      ;;
      *)
        echo "$ERROR Open not configured for $2"
        exit 1
      ;;
    esac
    exit 0
  ;;
  link)
    if [[ -z $3 ]]; then
      echo "$ERROR No target service for link provided."
      exit 1
    fi
    if [[ ! ${LINK_SOURCES} =~ (^|[[:space:]])$2($|\,) ]]; then
      echo "$ERROR Provided service '$2' not a possible source for link: ${LINK_SOURCES}"
      exit 1
    fi
    if [[ ! ${LINK_TARGETS} =~ (^|[[:space:]])$3($|\,) ]]; then
      echo "$ERROR Provided service '$3' not a possible target for link: ${LINK_TARGETS}"
      exit 1
    fi
    ./setup.sh link $2 $3
    exit_on_error $?
    echo "$ATTENTION If the link is not working as expected please check if the source is mounted correctly in docker compose of the target"
    echo "$SUCCESS Linked $2 into $3"
    exit 0
  ;;
esac

if [[ ! ${MAIN_SERVICES} =~ (^|[[:space:]])$2($|\,) ]]; then
  echo "${HELP_TEXT}"
  echo "$ERROR Provided service '$2' not in main service list: $MAIN_SERVICES"
  exit 1
fi

case "$1" in
  up|start)
    ./setup.sh check $2
    exit_on_error $?
    "$0" upRequirements
    exit_on_error $?
    "$0" run "$2"
  ;;
  down|stop)
    "$0" stopIfNotNeeded $2
    "$0" stopIfNotNeeded redis
    "$0" stopIfNotNeeded rabbitmq
    "$0" stopIfNotNeeded db
    "$0" stopIfNotNeeded proxy
    echo "$SUCCESS down"
  ;;
  restart)
    "$0" stopIfRunning $2
    exit_on_error $?
    "$0" up $2
    exit_on_error $?
    "$0" tail $2
  ;;
  testProduction)
    "$0" down $2
    "$0" down "$2-prod"
    "$0" upRequirements
    docker-compose pull "$2-prod"
    exit_on_error $?
    docker-compose up -d "$2-prod"
    exit_on_error $?
    "$0" tail "$2-prod"
  ;;
  *)
    # Cannot deal with that request
    echo "${HELP_TEXT}"
    echo "$ERROR Unknown command '$1'"
    exit 1
  ;;
esac
