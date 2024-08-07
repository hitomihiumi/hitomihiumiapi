import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { Client, GatewayIntentBits, PresenceUpdateStatus, ActivityType, UserFlagsString, Activity, Presence } from 'discord.js';
import * as info from '../package.json';
import { config } from 'dotenv';
import { getSize, assetsURL, getFlags } from './handlers/functions';

config();

const app = express();

app.use(express.json());

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

["antiCrash"].filter(Boolean)
    .forEach(h => {
        require(`./handlers/${h}`)(client);
    })

interface CustomError extends Error {
    status?: number;
}

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

app.get('/v1/guilds/:guildId', cors(corsOptions), async (req: Request, res: Response, next: NextFunction) => {
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

app.get('/v1/users/:userId', cors(corsOptions), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await client.users.fetch(req.params.userId, { force: true });
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
                        case "badges":
                            // @ts-ignore
                            res.send(getFlags(user.flags.toArray()));
                            break;
                    }
                } else {
                    let badges: string[] = [];
                    let banner: string = "";
                    let avatarDecorationURL: string = "";
                    let presence: any = {};

                    let data = { ...user, badges, banner, avatarDecorationURL, presence };

                    if (user.flags) data.badges = getFlags(user.flags.toArray());
                    // @ts-ignore
                    if (user.bannerURL({ size: 4096 })) data.banner = user.bannerURL({ size: 4096 });
                    // @ts-ignore
                    if (user.avatarDecorationURL({ size: 4096 })) data.avatarDecorationURL = user.avatarDecorationURL({ size: 4096 });

                    try {
                        // @ts-ignore
                        client.guilds.fetch(process.env.BASE_GUILD).then(async(guild) => {
                            let member = guild.members.cache.get(user.id)
                            if (member) {

                                data.presence = member.presence;

                                data.presence.activities.forEach((activity: Activity) => {
                                    if (activity.name !== "Custom Status") {
                                        let assets = { largeImageURL: "", smallImageURL: "" }
                                        // @ts-ignore
                                        assets = assetsURL(activity, assets);

                                        if (activity.assets) {
                                            activity.assets.largeImage = assets.largeImageURL;
                                            activity.assets.smallImage = assets.smallImageURL;
                                        }
                                    }
                                })


                                res.send({
                                    status: 200,
                                    message: "User found!",
                                    data: data
                                });
                            } else {
                                res.send({
                                    status: 200,
                                    message: "User found!",
                                    data: data
                                });
                            }
                        });
                    } catch {
                        res.send({
                            status: 200,
                            message: "User found!",
                            data: data
                        });
                    }
                }
            }
    } catch {
        const error: CustomError = new Error('Invalid ID');
        error.status = 404;
        return next(error);
    }
});

app.use((err: CustomError, req: Request, res: Response, next: NextFunction) => {
    console.error(err.message);
    if (err.status === 404) {
        return res.status(404).send({ error: 'Not Found' });
    }
    res.status(500).send({ error: 'Internal Server Error' });
});

app.listen(process.env.PORT || 3001, () => {
  console.log(`Server is running on port ${process.env.PORT || 3001}`);
});

client.login(process.env.TOKEN);