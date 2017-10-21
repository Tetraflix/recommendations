# Recommendations Service

## Inputs

### Session Data:
User testing group, session ID, user ID, total recommended movies watched during a session, total non-recommended movies watched during a session

```
{
sessionId: 12343446435,
userId: 534356757834,
groupId: 1,
recs: 1.0,
nonRecs: 0.7
} 
```

### User Profiles Data:
User ID, list of already watched movie IDs, updated genre preferences

```
{
userId: 534356757834,
profile: {action: 33, comedy: 20, drama: 44, romance: 33,
SF: 2, ...},
movieHistory: [543, 155, ...]
} 
```

### Movie Changes (time permitting):
Row data packet with information on change to the Client Services movie database: movie ID, action performed on row (updated, deleted, or added), value(s) changed (if action !== deleted)

## Outputs

### Current User Recommendations:
User ID, list of recommended movie IDs

```
{
  userId: 534356757834,
  rec: [23, 105, 765, 32, 479]
} 
```


