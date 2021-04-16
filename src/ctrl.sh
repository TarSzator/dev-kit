#!/usr/bin/env bash


HELP_TEXT="
  open <service>             Opens the specified service. Main start command. Supports services 'game' and 'adminServer'.
  restart <service>          Restarts the service and tails the log.
  debugProxy                 Restarts the proxy container and tails the log.
  buildLiveGame              Build the game to connect to the live game server.
  buildLocalGame             Build the game to connect to the local game server.
  dbMigrate                  Runs db migration on db container.
  dbSeed                     Runs db seeding on db container.
  buildGame <GBC_HOST>       Build the game to connect to the specified host.
"

case "$1" in
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
  restart)
    "$0" stopIfRunning $2
    exit_on_error $?
    "$0" up $2
    exit_on_error $?
    "$0" tail $2
  ;;
esac
