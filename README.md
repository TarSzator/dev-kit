# Dev Kit
Tool to run local dev environments

![CI Badge](https://github.com/TarSzator/dev-kit/workflows/CI/badge.svg)

## Getting started

1. The DevKit operates under the assumption that you have a folder for all your projects, a sub-folder for each project and in that a folder for each repository / project that belongs to it
   ```sh
    - projects
       |- tool
       |  |-tool-api
       |  |-tool-client
       |   
       |- project2
   ```
1. Create folder for your new DevKit (in this example we call it tool-dev-kit)
   ```sh
   mkdir projects/tool/tool-dev-kit
   ```
1. Go into that project
   ```sh
   cd my-dev-kit
   ```
1. Init a npm project
   ```sh
   npm init
   ```
   Answer all question how you want it
1. Install the dev-kit
   ```sh
   npm i @rene.simon/dev-kit
   ```
1. Execute setup
   ```sh
   devKitSetup
   ```
   Answer all question how you want it  
   - in this example we name the shell script `tCtrl`
1. Add your services to the services section of the docker-compose.yml
   ```yml
   tool-api:
      container_name: $TOOL_API_NAME
      build:
         context: $TOOL_API_LOCAL_PATH
      command: "npm run dev"
      working_dir: /app/tool-api
      volumes:
         - '$TOOL_API_LOCAL_PATH:/app/tool-api'
         - '~/.npmrc:/root/.npmrc'
      env_file:
         - .env
      environment:
         PORT: $TOOL_API_PORT
      networks:
         - net
      labels:
      healthcheck:
         test: "wget -qO - localhost:$TOOL_API_PORT/healthcheck"
         interval: 15s
         timeout: 2s
         retries: 4
         start_period: 30s
   tool-client:
      container_name: "$TOOL_CLIENT_NAME"
      image: "node:14.16.1"
      env_file:
         - .env
      volumes:
         - '$TOOL_CLIENT_LOCAL_PATH:/app/tool-client'
         - '~/.npmrc:/root/.npmrc'
      networks:
         - net
      labels:
   ```
   IMPORTANT:
      - Service names:  
        Must be in `param-case`  
        All connected variables must be prefixed with the same name as `CONSTANT_CASE`
     - Volumes:  
       For link to work the node code as to run in a folder named like the real folder in app  
       /tool/tool-api --> /app/tool-api
     - All services need to use the same network
1. Run setup again to trigger label creation  
   (you can run this anytime you want to check if your environment is still up to specs)
   ```sh
   devKitSetup
   ```
1. You might be asked to set some missing labels for you added services
   1. Add types
      - internal: Defines that this is a service that is developed by you.  
        Most functions of the dev kit are only allowed for internal services.
      - node: All services that are node projects and should be marked as such
      - tool: Marks services that are tool projects like DBs
      - server: Services that run as servers.
      - linkSource: service project can be linked to another service
      - linkTarget: service can have another service linked too
   1. Add dependencies
      - Services that should run before this service runs
      - Usually these are dbs
   1. Add openUrl
      - Url that is opened when the open action is used
      - Environment variables are allowed
1. Configure environment
   1. You need to add `${SERVICE_NAME}_REPO` and `${SERVICE_NAME}_LOCAL_PATH` for each internal project
   1. Service name is the name of the internal service in `CONSTANT_CASE`
   1. Consider changing the generic values by prefixing them for you project.  
      e.g.: `NETWORK_NAME=net` --> `NETWORK_NAME=tool-net`
   1. Sadly I did not yet solve the issue with cross-project linking.  
      The current workaround required to set the `${SERVICE_NAME}_LOCAL_PATH` like the following example  
      `TOOL_API_LOCAL_PATH=../../tool/tool-api`
   1. For each service that that provides an API you should also configure `${SERVICE_NAME}_PORT` and `${SERVICE_NAME}_EXTERNAL_PORT`
      Where `${SERVICE_NAME}_PORT` defines the port your services will listen too and
      `${SERVICE_NAME}_EXTERNAL_PORT` the port how you want to access the service from your host
1. Run setup of your project
   ```sh
   ./bin/run.js setup
   ```
1. Configure the proxy to do HTTPS deconstruction for you services  
   Add to config/Caddyfile for each HTTP service a config.
   Example:
   ```
   {$HOST}:{$TOOL_API_EXTERNAL_PORT} {
     tls /config/{$SSL_CERT_PREFIX}-local.crt /config/{$SSL_CERT_PREFIX}-local.key
     reverse_proxy {
       to http://tool-api:{$TOOL_API_PORT}
     }
   }
   ```
1. Configure the proxy service to allow your host to access these external ports by extending the ports section of the docker-compose.yml proxy service
   ```yml
   services:
     proxy:
       [...]
       ports:
       - $TOOL_API_EXTERNAL_PORT:$TOOL_API_EXTERNAL_PORT
       [...]
   ```
1. Now you can run `help` to see all your actions
   ```sh
   tCtrl help
   ```
