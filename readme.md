# README

This is a simple API to get user and discord server information.

API is available at [https://api.hitomihiumi.xyz/](https://api.hitomihiumi.xyz/).

## Endpoints

### GET /v1/user/:id

Get user information by ID.

#### Parameters

- `id` - User ID

#### Possible query parameters

- `size` - Image size (default: 4096)
- `forceStatic` - Force static image (default: false)
- `content` - Type of field to display (default: all)

#### Possible values for `content` parameter
<table>
    <tr>
        <th>Parameter</th>
        <th>Description</th>
    </tr>
    <tr>
        <td>tag</td>
        <td>The tag of this user This user's username, or their legacy tag (e.g. hydrabolt#0001) if they're using the legacy username system</td>
    </tr>
    <tr>
        <td>username</td>
        <td>The username of the user</td>
    </tr>
    <tr>
        <td>globalName</td>
        <td>The global name of this user</td>
    </tr>
    <tr>
        <td>discriminator</td>
        <td>The discriminator of this user '0', or a 4-digit stringified number if they're using the legacy username system</td>
    </tr>
    <tr>
        <td>avatar</td>
        <td>Redirect to discord user's avatar link</td>
    </tr>
    <tr>
        <td>avatarURL</td>
        <td>A link to the user's avatar</td>
    </tr>
    <tr>
        <td>banner</td>
        <td>Redirect to discord user's banner link</td>
    </tr>
    <tr>
        <td>bannerURL</td>
        <td>A link to the user's banner</td>
    </tr>
    <tr>
        <td>avatarDecoration</td>
        <td>Redirect to discord user's avatar decoration link</td>
    </tr>
    <tr>
        <td>avatarDecorationURL</td>
        <td>A link to the user's avatar decoration</td>
    </tr>
    <tr>
        <td>id</td>
        <td>The user's id</td>
    </tr>
    <tr>
        <td>createdTimestamp</td>
        <td>The timestamp the user was created at</td>
    </tr>
    <tr>
        <td>createdAt</td>
        <td>The time the user was created at</td>
    </tr>
    <tr>
        <td>bot</td>
        <td>Whether or not the user is a bot</td>
    </tr>
    <tr>
        <td>system</td>
        <td>Whether the user is an Official Discord System user (part of the urgent message system)</td>
    </tr>
    <tr>
        <td>flags</td>
        <td>The flags for this user</td>
    </tr>
    <tr>
        <td>hexAccentColor</td>
        <td>The hexadecimal version of the user accent color, with a leading hash The user must be force fetched for this property to be present</td>
    </tr>
    <tr>
        <td>accentColor</td>
        <td>The base 10 accent color of the user's banner The user must be force fetched for this property to be present or be updated</td>
    </tr>
    <tr>
        <td>presence</td>
        <td>The presence of this guild member*</td>
    </tr>
</table>

*Presence available only for users who's joined to [this guild](https://discord.gg/sChVnU29UE).

#### Example

```http
GET http://localhost:3000/v1/user/991777093312585808?size=1024&forceStatic=true&content=avatar
```

### GET /v1/server/:id

Get server information by ID. **IMPORTANT!!! Information about the Discord server can be obtained only by having a [special bot](https://discord.com/api/oauth2/authorize?client_id=1127377486313955358&permissions=1024&scope=bot%20identify%20guilds&20applications.commands) on the server itself.**

#### Parameters

- `id` - Server ID

### GET /v2/steam/user/:userId

Get Steam user information by ID.

#### Parameters

- `userId` - Steam user ID

```http
GET http://localhost:3000/v2/steam/user/76561198066613958
```

### GET /v2/steam/user/:userId/games

Returns a list of games a player owns along with some playtime information, if the profile is publicly visible. Private, friends-only, and other privacy settings are not supported unless you are asking for your own personal details (ie the WebAPI key you are using is linked to the userId you are requesting).

#### Parameters

- `userId` - Steam user ID

```http
GET http://localhost:3000/v2/steam/user/76561198066613958/games
```

### GET /v2/steam/user/:userId/games/achievements/:appId

Returns a list of achievements for this user by app id.

#### Parameters

- `userId` - Steam user ID
- `appId` - Steam game ID

```http
GET http://localhost:3000/v2/steam/user/76561198066613958/games/achievements/730
```

### GET /v2/steam/user/:userId/games/stats/:appId

Returns a list of achievements for this user by app id.

#### Parameters

- `userId` - Steam user ID
- `appId` - Steam game ID

```http
GET http://localhost:3000/v2/steam/user/76561198066613958/games/stats/730
```

### GET /v2/steam/user/:userId/games/recently

Returns a list of games a player has played in the last two weeks, if the profile is publicly visible. Private, friends-only, and other privacy settings are not supported unless you are asking for your own personal details (ie the WebAPI key you are using is linked to the userId you are requesting).

#### Parameters

- `userId` - Steam user ID

```http
GET http://localhost:3000/v2/steam/user/76561198066613958/games/recently
```

### GET /v2/steam/game/icon/:appId

Returns a link to the game icon.

#### Parameters

- `appId` - Steam game ID

```http
GET http://localhost:3000/v2/steam/game/icon/730
```

### GET /v2/steam/game/grid/:appId

Returns a link to the game grid image.

#### Parameters

- `appId` - Steam game ID

```http
GET http://localhost:3000/v2/steam/game/grid/730
```

### GET /v2/steam/game/logo/:appId

Returns a link to the game logo image.

#### Parameters

- `appId` - Steam game ID

```http
GET http://localhost:3000/v2/steam/game/logo/730
```