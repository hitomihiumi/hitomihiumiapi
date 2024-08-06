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
    try {
        client.users.fetch(req.params.userId, { force: true }).then((user) => {
            if (!user) {
                res.status(404).send({
                    status: 404,
                    message: "User not found!"
                });
            } else {
                if (Object.keys(req.query).length > 0) {
                    switch (req.query.content) {
                        case "tag":
                            res.send(user.tag);
                            break;
                        case "username":
                            res.send(user.username);
                            break;
                        case "globalName":
                            res.send(user.globalName);
                            break;
                        case "discriminator":
                            res.send(user.discriminator);
                            break;
                        case "avatar":
                            res.redirect(user.displayAvatarURL({ forceStatic: Boolean(req.query.forceStatic), size: getSize(Number(req.query.size)) }));
                            break;
                        case "avatarURL":
                            res.send(user.avatarURL());
                            break;
                        case "banner":
                            if (typeof user.bannerURL({ forceStatic: Boolean(req.query.forceStatic), size: getSize(Number(req.query.size)) }) === "string") {
                                // @ts-ignore
                                res.redirect(user.bannerURL({ forceStatic: Boolean(req.query.forceStatic), size: getSize(Number(req.query.size)) }));
                            } else {
                                res.send({
                                    status: 404,
                                    message: "User banner not found!"
                                });
                            }
                            break;
                        case "bannerURL":
                            res.send(user.bannerURL({ forceStatic: Boolean(req.query.forceStatic), size: getSize(Number(req.query.size)) }));
                            break;
                        case "avatarDecoration":
                            if (typeof user.avatarDecorationURL({ size: getSize(Number(req.query.size)) }) === "string") {
                                // @ts-ignore
                                res.redirect(user.avatarDecorationURL({ size: getSize(Number(req.query.size)) }));
                            } else {
                                res.send({
                                    status: 404,
                                    message: "User avatar decoration not found!"
                                });
                            }
                            break;
                        case "avatarDecorationURL":
                            res.send(user.avatarDecorationURL({ size: getSize(Number(req.query.size)) }));
                            break;
                        case "id":
                            res.send(user.id);
                            break;
                        case "createdTimestamp":
                            res.send(user.createdTimestamp);
                            break;
                        case "createdAt":
                            res.send(user.createdAt);
                            break;
                        case "bot":
                            res.send(user.bot);
                            break;
                        case "system":
                            res.send(user.system);
                            break;
                        case "flags":
                            res.send(user.flags);
                            break;
                        case "hexAccentColor":
                            res.send(user.hexAccentColor);
                            break;
                        case "accentColor":
                            res.send(user.accentColor);
                            break;
                        case "presence":
                            try {
                                // @ts-ignore
                                client.guilds.fetch(process.env.BASE_GUILD).then((guild) => {
                                    guild.members.fetch(user.id).then((member: { presence: any; }) => {
                                        res.send(member.presence);
                                    });
                                });
                            } catch (error) {
                                res.status(404).send({
                                    status: 404,
                                    message: error
                                });
                            }
                            break;
                    }
                } else {
                    res.send({
                        status: 200,
                        message: "User found!",
                        data: user
                    });
                }
            }
        });
    } catch (error) {
        res.status(404).send({
            status: 404,
            message: error
        });
    }
});

function getSize(size: number) {
    switch (size) {
        case 16:
            return 16;
        case 32:
            return 32;
        case 64:
            return 64;
        case 128:
            return 128;
        case 256:
            return 256;
        case 512:
            return 512;
        case 1024:
            return 1024;
        case 2048:
            return 2048;
        case 4096:
            return 4096;
        default:
            return 4096;
    }
}

app.listen(process.env.PORT || 3001, () => {
  console.log(`Server is running on port ${process.env.PORT || 3001}`);
});

client.login(process.env.TOKEN);