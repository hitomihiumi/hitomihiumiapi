import express from 'express';
import cors from 'cors';
import { Client, GatewayIntentBits, PresenceUpdateStatus, ActivityType } from 'discord.js';
import * as info from '../package.json';
import { config } from 'dotenv';

config();

const app = express();

const client = new Client({
  shards: "auto",
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildPresences
  ],
  presence: {
    activities: [{
      name: `Discord-Web-API v${info.version}`,
      type: ActivityType.Streaming,
      url: "https://www.twitch.tv/hitomihiumi"
    }],
    status: PresenceUpdateStatus.Online
  }
});

var corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200
}

app.get('/', cors(corsOptions), (req, res) => {
    res.redirect('/v1/');
});

app.get('/v1/', cors(corsOptions), (req, res) => {
  res.send({
    version: info.version,
    status: 200,
    message: "Discord-Web-API is running!",
    endpoints: {
        guilds: {
            get: "/v1/guilds/:guildId"
        },
        users: {
            get: "/v1/users/:userId"
        }
    }
  });
});

app.get('/v1/guilds/:guildId', cors(corsOptions), async (req, res) => {
  client.guilds.fetch(req.params.guildId).then((guild) => {
      if (!guild) {
          res.status(404).send({
              status: 404,
              message: "Guild not found!"
          });
      } else {
          res.send({
              status: 200,
              message: "Guild found!",
              data: guild
          });
      }
  });
});

app.get('/v1/users/:userId', cors(corsOptions), async (req, res) => {
  client.users.fetch(req.params.userId).then((user) => {
      if (!user) {
          res.status(404).send({
              status: 404,
              message: "User not found!"
          });
      } else {
          res.send({
              status: 200,
              message: "User found!",
              data: user
          });
      }
  });
});

app.listen(process.env.PORT || 3001, () => {
  console.log(`Server is running on port ${process.env.PORT || 3001}`);
});

client.login(process.env.TOKEN);