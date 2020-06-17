# Shift3 NodeJs Boilerplate Server

NodeJs server written in Typescript. This will serve as a base point for any new Shift3 NodeJs projects.

## Project Requirements

**Docker**, **Docker Compose**

Installing docker on different operating systems:
- Mac: [Docker Installation for Mac](https://docs.docker.com/docker-for-mac/install/)
- Ubuntu: [Docker Installation for Ubuntu](https://docs.docker.com/install/linux/docker-ce/ubuntu/)
- Windows: [Docker Installation for Windows Requires Windows Pro](https://docs.docker.com/docker-for-windows/install/)
- Homebrew: `brew cask install docker` [Stackoverflow Resource](https://stackoverflow.com/questions/40523307/brew-install-docker-does-not-include-docker-engine)

Install docker compose:
- [Docker compose installation instructions](https://docs.docker.com/compose/install/)

### Using The Docker Cli

Docker for the most part is run from the terminal, the docker cli is fairly straight forward.

Docker cli documentation:
- [Docker Cli](https://docs.docker.com/engine/reference/commandline/cli/)

## Project Setup

Obtain a .env file from the Zoho Vault and plave it in the root directory of the project. Once Docker and docker-compose are installed correctly, simply run `docker-compose up` from the root. This will startup both the server and the postgres database.

The postgres database will have the name and user credentials that are specified in the .env file. If you need to change them and don't mind resetting the database, you will have to use the command `docker-compose down -v` to remove both the containers and the volumes.

Once the server is up and running simply navigate to [localhost:3000](http://localhost:3000)! The database should be connectable via a database client such as [PGAdmin](https://www.pgadmin.org/) or [DBeaver](https://dbeaver.io/) by using the credentials in your .env to connect to [localhost:5432].

### Environment Variables

PORT=

## Development Process

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment Process

Staging - TBD

Production - TBD