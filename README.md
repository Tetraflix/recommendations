# Recommendations Service

## The Business Question:
Among users who don’t leave ratings, do recommendations based on modeled user genre preferences outperform recommendations based on fixed genre preferences?
  - KPI: total ratio of recommended movies watched to total movies watched per test group per day
  - “Fixed genre preferences” refer to genre preferences set by a user upon signup
  - Control Group: Group whose recommendations are generated from initially fixed genre preferences
  - Experimental: Group whose recommendations are generated from continually updated user genre preferences


The Recommendations service's role in answering this business question in conjunction with three more API services is to feed updated user genre preferences into an algorithm that matches the user with movies that have similar genre breakdowns. This data is then sent to the App Server to be presented to the client.

## Roadmap

View the project roadmap [here](ROADMAP.md)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

# Table of Contents

1. [Data Flow](#data-flow)
1. [Requirements](#requirements)
1. [Usage](#usage)
1. [System Architecture](#system-architecture)
1. [Inputs/Outputs](#inputs-and-outputs)

## Data Flow:
![Data Flow](https://github.com/Tetraflix/recommendations/blob/development/images/data-flow.jpeg)
#### Recommendations
  - Subscribed to one of the three Session Data channels (more detail on expected inputs in the [Inputs/Outputs](#inputs-and-outputs) section).
  - Stores session data in the form of ratios to visualize answer to business question.
  - Stores ratio of recommended movies watched to total movies watched per session in one database table.
  - Stores total average ratio of recommended movies watched to total movies watched in another database table.
  - Subscribed to User Profile Data channel on the message bus.
  - Feeds updated user genre preferences into a simple comparison algorithm that matches the user with movies that have similar genre breakdowns
  - Finds movies with similar genre breakdowns by calculating the euclidean distance between the vector representation of the user genre preferences and vector representations for movies that the user has not watched


## Requirements

- Node 6.9.x
- Redis 3.2.x
- Postgresql 9.6.x
- Elasticsearch 5.6.3
- Kibana 5.6.3
- Logstash 5.6.3

## Usage

### Docker Configuration

To run the application, redis database, and postgres database on Docker, define the host variable in database/movies/index.js like so:
```
const host = 'redis',
```
And define the host variable in database/ratios/index.js like so:
```
const host = 'postgres',
```

To run the application on your local machine (with separate running instances of redis and postgres on your local machine), define the host variable in database/movies/index.js like so:
```
const host = 'localhost',
```
And define the host variable in database/ratios/index.js like so:
```
const host = 'localhost',
```

The two databases are configured to rely on this assignment in the main server file to facilitate developer changes. If you choose to run this application in Docker, configure your [Dockerfile](https://docs.docker.com/engine/reference/builder/) like so, making sure that the number following 'EXPOSE' is the port that you are running your application on (if you choose to change this value in server/index.js):
```
FROM node:9.0

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

EXPOSE 3000
```
This application makes use of [docker-compose](https://docs.docker.com/compose/) to load and run linked images. If you are on a Linux machine, make sure to download docker-compose alongside Docker. To load the database dependencies, configure your docker-compose.yml file in the same directory like so:
(Replace the bracketed fields ```[POSTGRES PASSWORD]``` and ```[POSTGRES USER]``` with your postgres credentials. You may also need to modify the "ports" property under "web" based on the port you exposed in your Dockerfile and/or on the port you wish to run the application on. This Dockerfile keeps the redis and postgres database ports as their default values.)
```
version: '2'
services:
  redis:
    image: "redis:3"
  postgres:
    image: "postgres:10"
    environment:
     POSTGRES_PASSWORD: [POSTGRES PASSWORD]
     POSTGRES_USER: [POSTGRES USER]
     POSTGRES_DB: "ratios"
  web:
    build: .
    ports:
     - "3000:3000"
    volumes:
     - .:/usr/src/app
     - /usr/src/app/node_modules
    depends_on:
      - postgres
      - redis
    command: ["npm", "start"]
```

To load all images and start running the application, use the command ```docker-compose up``` from the same directory. For more information on getting started with Docker and Docker-compose, see the [official Docker documentation](https://docs.docker.com/get-started/).

### Elasticsearch Configuration (without Docker)
The following information is not incorporated with the Docker-contained version of the application, since Docker is used here primarily as a tool to maintain proper environment variables for the purposes of deployment. Because this application is deployed as an EC2 instance on AWS, which has access to elasticsearch, elasticsearch is not necessary to include in the docker-ized version of the application. This means, however, that elasticsearch must still be configured manually if the application is run on your local machine.

#### Elasticsearch

The sessions database is integrated with Elasticsearch such that every message processed in inserted into the PostgreSQL database is also sent for analytical purposes to the Elasticsearch client. [Elastic's official Getting Started with ElasticSearch Guide](https://www.elastic.co/guide/en/elasticsearch/reference/current/getting-started.html) outlines installation and configuration.

The client is set up like so in database/dashboard/dashboardData.js:
(Replace the bracketed field ```[ELASTICSEARCH PORT]``` with the port on which your elasticsearch instance is running. Elasticsearch is set to run on port 9200 by default.)

```
const ElasticSearch = require('elasticsearch');

const client = new ElasticSearch.Client({
  host: {
    host: '127.0.0.1',
    port: '[ELASTICSEARCH PORT]',
  },
});

client.ping({ requestTimeout: 30000 }, (err) => {
  if (err) {
    console.error('elasticsearch cluster is down', err);
  } else {
    console.log('All is well with elasticsearch!');
  }
});
```

To run the elasticsearch instance on your local machine, run ``` bin/elasticsearch ``` from within the downloaded elasticsearch directory.

#### Kibana

The Kibana server is configured to display data sent to the Elasticsearch client either manually or through Logstash (see section below for Logstash configuration details). For installation and set up, refer to [Elastic's official Getting Started with Kibana Guide](https://www.elastic.co/guide/en/kibana/current/reporting-getting-started.html).

In config/kibana.yml (from within the downloaded Kibana directory), make sure that Kibana is configured to point to your elasticsearch instance. The default host is localhost, and the default port is 9200. Ensure that if you change these settings in Elasticsearch, you update the following line in your kibana.yml file to reflect those changes:
```
#elasticsearch.url: "http://localhost:9200"
```

The Kibana dashboard designed for the recommendations microservice displays data relevant to the overarching [business question](#the-business-question), in particular the ratio of recommended movies watched to non-recommended movies watched per day and per test group. The seed data generation script is built to produce a trend that mimics the expected behavior of un-simulated data. Other data of interest includes system metrics, including Amazon SQS message processing time (represented by request/response syntax for sake of simplicity).

An example visualization with the existing data generation scripts is provided in this screenshot:
![Data Flow](https://github.com/Tetraflix/recommendations/blob/development/images/kibanaExample.png)

To run the kibana instance on your local machine, run ``` bin/kibana ``` from within the downloaded kibana directory.

#### Logstash

Logstash is configured to pull logs from files that end in ".log" inside the "logs" directory. The actual logging of processed server requests is done using the modules Winston (for logging) and stream-rotate (to prevent memory overload). Currently, these modules are used in conjunction to monitor server performance, keeping track of requests, responses, and errors.

[Elastic's official Getting Started with Logstash guide](https://www.elastic.co/guide/en/logstash/current/getting-started-with-logstash.html) outlines the basic process of configuring Logstash.

logstash.conf format for the recommendations server:
(Replace the bracketed fields ```[PATH/TO/LOGS]``` with the file path to your .log files and ```[ELASTICSEARCH PORT]``` with the port on which your elasticsearch (9200 by default) instance is running.)
```
input {
  file {
    path => "[PATH/TO/LOGS]/*.log"
  }
  stdin { }
}
output {
  elasticsearch {
    hosts => ["localhost:[ELASTICSEARCH PORT]"]
  }
  stdout { codec => rubydebug }
}
```

The format of the Winston-logged system events looks like this:
```
{"level":"info","message":{"action":"response userdata","error":true}}
{"level":"info","message":{"action":"request sessiondata"}}
. . .
```

To run the logstash instance on your local machine, run ``` bin/logstash -f logstash.conf ``` (to run logstash using your custom configuration file) from within the downloaded logstash directory.

## System Architecture
![System Architecture](https://github.com/Tetraflix/recommendations/blob/development/images/architecture.png)

![Database Schema](https://github.com/Tetraflix/recommendations/blob/development/images/schema.png)

## Inputs and Outputs

### Inputs

#### Session Data:
User testing group, session ID, user ID, total recommended movies watched during a session, total non-recommended movies watched during a session

```
{
  userId: 5783,
  groupId: 1,
  recs: 1.0,
  nonRecs: 0.7
}
```

#### User Profiles Data:
User ID, list of already watched movie IDs, updated genre preferences

```
{
  userId: 5783,
  profile: [4, 4, 15, 2, 0, 6, 16, 2, 13, 18, 6, 4, 5, 1, 4],
  movieHistory: {543:1, 155:1, 1234:1, 2345:1, ...}
}
```

#### Movie Changes (time permitting):
Row data packet with information on change to the Client Services movie database: movie ID, action performed on row (updated, deleted, or added), value(s) changed (if action !== deleted)

### Outputs

#### Current User Recommendations:
User ID, list of recommended movie IDs

```
{
  userId: 5783,
  rec: [23879, 16605, 7695, 37892, 479, ...]
}
```
