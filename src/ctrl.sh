#!/usr/bin/env bash


HELP_TEXT="
  open <service>             Opens the specified service. Main start command. Supports services 'game' and 'adminServer'.
  up|start <service>         Starts the specified service and it's requirements.
  down|stop <service>        Stops the specified service and it's requirements that are no longer needed.
  buildLiveGame              Build the game to connect to the live game server.
  buildLocalGame             Build the game to connect to the local game server.
  restart <service>          Restarts the service and tails the log.
  dbMigrate                  Runs db migration on db container.
  dbSeed                     Runs db seeding on db container.
  debugProxy                 Restarts the proxy container and tails the log.
$YELLOW""Commands for internal use. Use with caution:$DEFAULT
  upRequirements             Starts all containers requirement containers.
  healthcheck <service>      Checks if a specified service is running and healthy.
  run <service>              Starts the service if it is not already running.
  stopIfNotNeeded <service>  Stops a service if it is running and no longer needed.
  stopIfRunning <service>    Stops a service if it is running.
  buildGame <GBC_HOST>       Build the game to connect to the specified host.
"

case "$1" in
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
esac

if [[ ! ${NODE_SERVICES} =~ (^|[[:space:]])$2($|\,) ]]; then
  echo "$ERROR Provided service '$2' not in node service list: ${NODE_SERVICES}"
  exit 1
fi

case "$1" in
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
    esac
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
esac
