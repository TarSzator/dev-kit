## [Unreleased]

## [0.13.0][] - 2023-04-13

1. Added `updateMfaProfile` action

## [0.12.2][] - 2023-03-01

1. Fixed new service column name issue
2. Fixed change in docker compose var usage

## [0.12.1][] - 2022-09-13

1. Fix `link` to make options optional

## [0.12.0][] - 2022-08-30

1. Adds `verbose` option to `buildImage` action

## [0.11.1][] - 2022-08-19

1. Improving linking to be more use-case specific

## [0.11.0][] - 2022-08-19

1. Adding options to help file
2. Adding options to install action
3. Adding options to link action

## [0.10.5][] - 2022-08-04

1. Fixes bug with run command without env variables

## [0.10.4][] - 2022-08-02

1. Fixes using sudo for all check commands

## [0.10.3][] - 2022-08-02

1. Fixes cert registration checks

## [0.10.2][] - 2022-08-02

1. Fix truthy check

## [0.10.1][] - 2022-08-02

1. Dynamically determine shell

## [0.10.0][] - 2022-08-01

1. Fix issue with folders on setup
2. Fix issue with cert registry and un-registry for systems other than MacOS

## [0.9.0][] - 2022-07-30

1. Adds "run" action

## [0.8.1][] - 2022-07-10

1. Fixes install as sub-action call. Like in the setup action.

## [0.8.0][] - 2022-04-07

1. Allow integration and unit test of specific file
2. Allow installation of new module

## [0.7.9][] - 2022-03-21

1. Allow options for hardUpdate

## [0.7.8][] - 2022-01-21

1. Fixes issue with TTY on openIaC

## [0.7.7][] - 2021-10-18

1. Extend certificate by docker host url

## [0.7.6][] - 2021-09-06

1. Removed some unnecessary node dependencies

## [0.7.5][] - 2021-08-16

1. Fixes issue with new 'docker ps' response for no running instance

## [0.7.4][] - 2021-08-12

1. Fixes TTY issues for MFA credentials generation

## [0.7.3][] - 2021-08-03

1. Fixes issue with different names of status column in docker ps response

## [0.7.2][] - 2021-08-03

1. Improves docker ps header recognition

## [0.7.1][] - 2021-07-23

1. Adds environment information to error to docker errors with environment context

## [0.7.0][] - 2021-07-21

1. Handles Ctrl+C exits without error
1. Adds openIaC action

## [0.6.1][] - 2021-07-21

1. Fixes to support new "docker-compose ps" response to evaluate service health
1. Handle absolute link path to determine dev kit root path

## [0.6.0][] - 2021-07-09

1. Adds option to "login" to select shell
1. Adds "exec" command

## [0.5.1][] - 2021-07-02

1. Fix issues with non node internal projects

## [0.5.0][] - 2021-06-29

1. Adds ability to extend environment when executing a shell command

## [0.4.1][] - 2021-06-24

1. Fixes README typo

## [0.4.0][] - 2021-06-18

1. Exports io function to be used by private actions
1. Adds some validators

## [0.3.1][] - 2021-06-13

1. Fixes missing InvalidInputError export

## [0.3.0][] - 2021-05-29

1. Adds action "buildImage" to build docker images

## [0.2.6][] - 2021-05-28

1. Improve certificate creation

## [0.2.5][] - 2021-05-20

1. Exports most functions to be used by private actions
1. Fixes issue with linked paths

## [0.2.4][] - 2021-05-20

1. Fixes issue with certain errors

## [0.2.3][] - 2021-05-19

1. Cleanup dependencies

## [0.2.2][] - 2021-05-19

1. Updates dependency packages

## [0.2.1][] - 2021-05-19

1. Fixes issue with dependency circles

## [0.2.0][] - 2021-05-03

1. Adds integrationTest and unitTest actions

## [0.1.1][] - 2021-04-28

1. Improves `devKitSetup`
1. Reworks link system
1. Improves `README`
1. Changes dev-kit service commands to support new link system

## [0.1.0][] - 2021-04-26

1. Adds exports of validators and errors for external module development
1. Adds support of the external action "requirements-check" to check requirements for your dev kit to run

## [0.0.5][] - 2021-04-26

1. Cleanup after fixes for CI pipeline publish stage

## [0.0.4][] - 2021-04-26

1. Tries to fix CI pipeline publish stage #2

## [0.0.3][] - 2021-04-26

1. Tries to fix CI pipeline publish stage

## [0.0.2][] - 2021-04-26

1. Fixes CI pipeline publish stage

## [0.0.1][] - 2021-04-26

1. Start development

[unreleased]: https://github.com/TarSzator/dev-kit/compare/v0.12.2...HEAD
[0.12.2]: https://github.com/TarSzator/dev-kit/compare/v0.12.1...v0.12.2
[0.12.1]: https://github.com/TarSzator/dev-kit/compare/v0.12.0...v0.12.1
[0.12.0]: https://github.com/TarSzator/dev-kit/compare/v0.11.1...v0.12.0
[0.11.1]: https://github.com/TarSzator/dev-kit/compare/v0.11.0...v0.11.1
[0.11.0]: https://github.com/TarSzator/dev-kit/compare/v0.10.5...v0.11.0
[0.10.5]: https://github.com/TarSzator/dev-kit/compare/v0.10.4...v0.10.5
[0.10.4]: https://github.com/TarSzator/dev-kit/compare/v0.10.3...v0.10.4
[0.10.3]: https://github.com/TarSzator/dev-kit/compare/v0.10.2...v0.10.3
[0.10.2]: https://github.com/TarSzator/dev-kit/compare/v0.10.1...v0.10.2
[0.10.1]: https://github.com/TarSzator/dev-kit/compare/v0.10.0...v0.10.1
[0.10.0]: https://github.com/TarSzator/dev-kit/compare/v0.9.0...v0.10.0
[0.9.0]: https://github.com/TarSzator/dev-kit/compare/v0.8.1...v0.9.0
[0.8.1]: https://github.com/TarSzator/dev-kit/compare/v0.8.0...v0.8.1
[0.8.0]: https://github.com/TarSzator/dev-kit/compare/v0.7.9...v0.8.0
[0.7.9]: https://github.com/TarSzator/dev-kit/compare/v0.7.8...v0.7.9
[0.7.8]: https://github.com/TarSzator/dev-kit/compare/v0.7.7...v0.7.8
[0.7.7]: https://github.com/TarSzator/dev-kit/compare/v0.7.6...v0.7.7
[0.7.6]: https://github.com/TarSzator/dev-kit/compare/v0.7.5...v0.7.6
[0.7.5]: https://github.com/TarSzator/dev-kit/compare/v0.7.4...v0.7.5
[0.7.4]: https://github.com/TarSzator/dev-kit/compare/v0.7.3...v0.7.4
[0.7.3]: https://github.com/TarSzator/dev-kit/compare/v0.7.2...v0.7.3
[0.7.2]: https://github.com/TarSzator/dev-kit/compare/v0.7.1...v0.7.2
[0.7.1]: https://github.com/TarSzator/dev-kit/compare/v0.7.0...v0.7.1
[0.7.0]: https://github.com/TarSzator/dev-kit/compare/v0.6.1...v0.7.0
[0.6.1]: https://github.com/TarSzator/dev-kit/compare/v0.6.0...v0.6.1
[0.6.0]: https://github.com/TarSzator/dev-kit/compare/v0.5.1...v0.6.0
[0.5.1]: https://github.com/TarSzator/dev-kit/compare/v0.5.0...v0.5.1
[0.5.0]: https://github.com/TarSzator/dev-kit/compare/v0.4.1...v0.5.0
[0.4.1]: https://github.com/TarSzator/dev-kit/compare/v0.4.0...v0.4.1
[0.4.0]: https://github.com/TarSzator/dev-kit/compare/v0.3.1...v0.4.0
[0.3.1]: https://github.com/TarSzator/dev-kit/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/TarSzator/dev-kit/compare/v0.2.6...v0.3.0
[0.2.6]: https://github.com/TarSzator/dev-kit/compare/v0.2.5...v0.2.6
[0.2.5]: https://github.com/TarSzator/dev-kit/compare/v0.2.4...v0.2.5
[0.2.4]: https://github.com/TarSzator/dev-kit/compare/v0.2.3...v0.2.4
[0.2.3]: https://github.com/TarSzator/dev-kit/compare/v0.2.2...v0.2.3
[0.2.2]: https://github.com/TarSzator/dev-kit/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/TarSzator/dev-kit/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/TarSzator/dev-kit/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/TarSzator/dev-kit/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/TarSzator/dev-kit/compare/v0.0.5...v0.1.0
[0.0.5]: https://github.com/TarSzator/dev-kit/compare/v0.0.4...v0.0.5
[0.0.4]: https://github.com/TarSzator/dev-kit/compare/v0.0.3...v0.0.4
[0.0.3]: https://github.com/TarSzator/dev-kit/compare/v0.0.2...v0.0.3
[0.0.2]: https://github.com/TarSzator/dev-kit/compare/v0.0.1...v0.0.2
[0.0.1]: https://github.com/TarSzator/dev-kit/tree/v0.0.1


[Unreleased]: https://github.com/TarSzator/dev-kit/compare/v0.13.0...HEAD
[0.13.0]: https://github.com/TarSzator/dev-kit/tree/v0.13.0