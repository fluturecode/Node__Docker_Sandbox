# Shift3 NodeJs Boilerplate Server

[![CircleCI](https://circleci.com/gh/Shift3/boilerplate-server-node.svg?style=svg&circle-token=7f194099af758d7db29fee056afd5859543e50d4)](https://circleci.com/gh/Shift3/boilerplate-server-node)

NodeJs server written in Typescript. This will serve as a base point for any new Shift3 NodeJs projects.

## Project Requirements

**Docker**, **Docker Compose**

**Node**, **nvm**

Node versions can be a pain to keep up with. To solve this we use nvm:

- Installation (Mac and Linux): [nvm](https://github.com/nvm-sh/nvm)
- Installation (Windows): [WSL 2](https://docs.microsoft.com/en-us/windows/nodejs/setup-on-wsl2)

**Terraform**

Terraform is our IaC (Infrastructure as Code) tool of choice. It allows us to easily provision our AWS infrastructure, in a version controlled environment!

- Installation: [Terraform](https://www.terraform.io/downloads.html)

### Using The Docker Cli

Docker for the most part is run from the terminal, the docker cli is fairly straight forward.

Docker cli documentation:
- [Docker Cli](https://docs.docker.com/engine/reference/commandline/cli/)

## Project Setup

The first steps are to install all of the project requirements above, skipping any you may already have installed.

1. Run `npm install`
2. Copy the .env.example file into .env at the root
    - Grab the environment variables from a developer on the project of Zoho Vault.
3. Run `docker-compose up`
    - This will startup both the server and the postgres database.

The postgres database will have the name and user credentials that are specified in the .env file. If you need to change them and don't mind resetting the database, you will have to use the command `docker-compose down -v` to remove both the containers and the volumes.

Once the server is up and running simply navigate to [localhost:3000](http://localhost:3000)! The database should be connectable via a database client such as [PGAdmin](https://www.pgadmin.org/) or [DBeaver](https://dbeaver.io/) by using the credentials in your .env to connect to [localhost:5432].

## Development Process

The application is built on [NestJs](https://github.com/nestjs/nest) and [Typescript](https://www.typescriptlang.org/) which gives us structure and typing, with [TypeORM](https://typeorm.io/#/) for communication with the database. This gives us a base structure we can follow and rely on.

##### Running the application

```bash
# Starts the application up in development mode
$ docker-compose up || npm run start:dev

# Starts the application up in production mode
$ npm run start:prod
```

##### Running tests

```bash
# Running all unit tests
$ npm run test

# Running unit tests in watch mode
$ npm run test:watch

# Running e2e tests
$ npm run test:e2e

# Checking test coverage
$ npm run test:cov
```

##### Models, Database and DTOs

NestJs and TypeORM give us some standards that promote good separation of concerns and code quality. This gives us the following model to abide by:

1. Controllers handle route logic using DTOs and communicate with services
2. Services handle business logic and communicate with repositories
3. Repositories handle communication with the database

This allows us to keep each piece clean, concise and easy to understand. We now know, where to look for certain issues, and where our code should live, depending on what it is doing.

Controllers should use the DTO to transfer only the data known by the app to services. Services then talk to the data layer (repositories) to make changes/retrieve data, and pass data back to the controller.

##### Utilities

The utilities folder represents global utilities used in the application. This ranges from JWT methods, email, logging and the database connection. Whenever you want to introduce new logic to the application, and it may be used in more than one place, consider making it into a utility that can be imported as required.

##### Interceptors

NestJs gives us some neat tools we can use to handle certain aspects of routes. Interceptors can be implemented if you need certain actions to happen either before the request hits any controllers, after or both. An example might be that you need to inspect a request before it hits your controller to log the information coming in (see [event-logger-interceptor](./src/interceptors/event-logger.interceptor.ts)). For more information checkout the documentation nest provides [NestJs Interceptors](https://docs.nestjs.com/interceptors)

##### Guards

Guards are basically middleware that allow us to take action before allowing the request to go through. The most simple use case is the JWT Guard, which will check for the JWT Token in the request and validate it. If the guard check fails, the request is rejected automatically. Nest gives us the ability to implement guards at the route level, controller level, or globally. You can find more information here [NestJs Guards](https://docs.nestjs.com/guards)

##### Swagger Documentation

NestJs gives us some nice [Swagger](https://docs.nestjs.com/openapi/introduction) integration that allows us to document the API naturally as we add endpoints. You can view the current documentation here:

- [Local Swagger Endpoint](http://localhost:3000/swagger)
- [Staging Swagger Endpoint](https://boilerplate-server-node.shift3sandbox.com/swagger/)

## Deployment Process

##### Setting up your infrastructure with Terraform

In order to deploy the application you will first need to change and run the Terraform scripts setup for you. If you have not already done so, download and install [Terraform](https://www.terraform.io/downloads.html).

Once this is done be sure to setup your staging environment files in the following folder `terraform/staging`. There you should find an `example.secrets-staging.tfvars` file, copy this file into the same folder renaming it to `secrets-staging.auto.tfvars` and fill in the variables for your project.

Be sure to check with your team before any changes are made via Terraform, and that everything being created is required by the project.

Once this is completed, navigate to the staging folder in your terminal and run the following commands:

1. `terraform plan`
    - The plan command will give you information on what will be built through Terraform, as well as any feedback if there will be forseen issues (missing variables etc.)
    - This also gives you the chance to make adjustments if need be to ensure the output is correct for what you need. (domain name, environment variables for EB etc.)
2. `terraform apply`
    - The apply command will actually setup all of the required AWS services to deploy this project. Terraform will save a state file for you, and can continue from where it left off if something goes wrong.

If all goes well, you can then begin the actual deployment of your code!

##### Deploying your application

Deployments are all done using the deployment script included in the project. Simply copy the `deploy.example.sh` file to `deploy.sh` in the root of the project. Fill in the variables at the top of the script, or get the script from Zoho Vault/Project lead. Then ensure you copy the `Dockerrun.example.aws.json` file to `Dockerrun.aws.json` file in the root. Get the image name from your project lead or from the ecr repository directions. [Setting up ECR](https://docs.aws.amazon.com/AmazonECR/latest/userguide/getting-started-console.html)

Before every deployment, make sure to update the following items:

1. Update the version of the application in the `Dockerrun.aws.json` file, be sure to add and commit any file changes.
2. Update your project version in the `package.json`

Once you've done all required checks, and are ready to proceed, run the following commands to deploy your code.

1. Ensure you are deploying to the correct environment (Sandbox vs Production)
2. Run `bash docker-deploy.sh` and when prompted enter the same version number in your `Dockerrun.aws.json` file.

The script will take care of building your project with Docker, deploying the latest build to ECR and finally running `eb deploy` to push your build to elastic beanstalk!