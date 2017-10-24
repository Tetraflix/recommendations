# Recommendations Service

The project description

## Roadmap

View the project roadmap [here](ROADMAP.md)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

# Table of Contents

1. [Data Flow](#data-flow)
1. [Requirements](#requirements)
1. [System Architecture](#system-architecture)
1. [Inputs/Outputs](#inputs-and-outputs)

## Data Flow:
![Data Flow](https://github.com/Tetraflix/recommendations/blob/development/images/data-flow.jpeg)

1. App Server
  - Serves recommended movies for a user and movies searched by genre to the client when the client makes GET requests to the /recommendations and /:genre endpoints.

2. Events
  - Receives information from the client about click events associated with active sessions. There will be many different concurrent sessions for many different users, and many clicks associated with each.
  - Whenever an individual user session ends, as indicated by a triggering event, the Events server filters the ended session’s events from its database and interprets/packages the information about that user’s activity during their session (more detail in Events Documentation) to send to three channels on the message bus.
  - The Events service persists data about a completed user session.

3. User Profiles
  - Subscribed to one of the three Session Data channels (more detail on expected inputs in User Profiles Documentation).
  - Updates the user’s history of movies watched in the database.
  - If the user associated with the Session is in the Experimental group, updates user profile using the list of historical movies user has watched.  User profile modeling will be based on exponentially weighted moving average (EXMA) of movie profiles to take into consideration content drift of user preference.
  - Sends the user’s current profile data (regardless of testing group) to the User Profile Data channel on the message bus.

4. Recommendations
  - Subscribed to one of the three Session Data channels (more detail on expected inputs in Recommendations Documentation).
  - Stores session data in the form of ratios to visualize answer to business question:
  - Stores ratio of recommended movies watched to total movies watched per session in one database table.
  - Stores total average ratio of recommended movies watched to total movies watched in another database table.
  - Subscribed to User Profile Data channel on the message bus.
  - Feeds updated user genre preferences into a simple comparison algorithm that matches the user with movies that have similar genre breakdowns
  - Finds movies with similar genre breakdowns by calculating the euclidean distance between the vector representation of the user genre preferences and vector representations for movies that the user has not watched

5. App Server
  - Subscribed to one of the three Session Data channels (more detail on expected inputs in App Server Documentation).
  - Using Session Data, updates “Currently Watching” field for the corresponding user to include most recent session data on movies in progress.
  - Using Session Data, updates cached total view counts in database for movies watched during the session.
  - Subscribed to Current Recommendations channel on the message bus.
  - Updates corresponding user’s current recommended movies list by matching the input movie IDs with its movie storage database, and stores this information in cached field in a speed-optimized database.
  - The server will now send the client different information when the user starts a new session.


## Requirements

- Node 6.9.x
- Redis 3.2.x
- Postgresql 9.6.x
- etc

## System Architecture
![System Architecture](https://github.com/Tetraflix/recommendations/blob/development/images/architecture.png)

![Database Schema](https://github.com/Tetraflix/recommendations/blob/development/images/schema.png)

## Inputs and Outputs

### Inputs

#### Session Data:
User testing group, session ID, user ID, total recommended movies watched during a session, total non-recommended movies watched during a session

```
{
  userId: 534356757834,
  groupId: 1,
  recs: 1.0,
  nonRecs: 0.7
}
```

#### User Profiles Data:
User ID, list of already watched movie IDs, updated genre preferences

```
{
  userId: 534356757834,
  profile: {action: 33, comedy: 20, drama: 44, romance: 33,
  SF: 2, ...},
  movieHistory: [543, 155, ...]
}
```

#### Movie Changes (time permitting):
Row data packet with information on change to the Client Services movie database: movie ID, action performed on row (updated, deleted, or added), value(s) changed (if action !== deleted)

### Outputs

#### Current User Recommendations:
User ID, list of recommended movie IDs

```
{
  userId: 534356757834,
  rec: [23, 105, 765, 32, 479]
}
```
