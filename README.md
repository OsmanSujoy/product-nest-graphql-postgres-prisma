# NestJS - GraphQL - Prisma - Postgres

<div align="center">
<a href="https://graphql.org/" target="blank"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/GraphQL_Logo.svg/512px-GraphQL_Logo.svg.png?20161105194737" width="120" alt="GraphQL Logo" /></a> <a href="https://www.prisma.io/" target="blank"><img src="https://seeklogo.com/images/P/prisma-logo-3805665B69-seeklogo.com.png" width="90" alt="Prisma Logo" /></a> <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a> <a href="https://www.postgresql.org/" target="blank"><img src="https://www.postgresql.org/media/img/about/press/elephant.png" width="120" alt="Postgres Logo" /></a>
</div>

<div align="center">
Backend <a href="https://nestjs.com/">NestJS</a> - <a href="https://graphql.org/">GraphQL</a> project using <a href="https://prisma.io/">Prisma </a> & <a href="https://postgresql.org/" >PostgreSQL</a>

</div>

## Postman collection & environment variables.

Please import both collections into your Postman.

## Installation

```bash
$ yarn
```

## Run Using Docker

```bash
$ docker compose up
```

```bash
# API Endpoint: localhost:4000
# pgAdmin: localhost:8080
```

All the credentials are available on the **.env** file.

## Note

Please update **.env** file with your DB URL if you want to use locally hosted database.
A start up script will be run to create an admin ID (Available in **.env**).

## Running the app

```bash
# development migration
$ yarn migrate

# development
$ yarn start:dev

# production mode
$ yarn start:migrate:prod
```

## Test

```bash
# unit tests
$ yarn test

# e2e tests
$ yarn test:e2e

# test coverage
$ yarn test:cov
```
