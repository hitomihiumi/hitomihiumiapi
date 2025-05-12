import express, { Request, Response, NextFunction } from 'express';
import {
    Client,
    GatewayIntentBits,
    PresenceUpdateStatus,
    ActivityType,
    Activity,
    WebhookClient,
    EmbedBuilder,
    Presence
} from 'discord.js';
import * as info from '../package.json';
import { config } from 'dotenv';
import {
    getSize,
    getFlags,
    getAllUserData,
    sortPackages,
    processResponse,
    extendProfile
} from './handlers/functions';
import type { Documentation } from "@hitomihiumi/micro-docgen";

import { Holder } from "./handlers/Holder";

const v_1 = new Holder('v1');
const v_2 = new Holder('v2');

v_1.init();
v_2.init();

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

const webhookClient = new WebhookClient({ url: process.env.ERROR_LOG_WEBHOOK as string });

interface CustomError extends Error {
    status?: number;
}

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
    next()
});

app.get('/', (req, res) => {
    res.redirect('/v2/');
});

app.get('/v1/', (req, res) => {
  res.status(200).send({
    version: info.version,
    message: "Discord-Web-API is running!",
    endpoints: {
        guilds: {
            get: "/v1/guilds/:guildId"
        },
        users: {
            get: "/v1/users/:userId"
        },
        docs: {
            get: "/v1/docs"
        }
    }
  });
});

app.get('/v1/guilds/:guildId', async (req: Request, res: Response, next: NextFunction) => {
  client.guilds.fetch(req.params.guildId).then((guild) => {
      if (!guild) {
          res.status(404).send({
              error: "Guild not found!"
          });
      } else {
          res.status(200).send({
              ...guild
          });
      }
  });
});

app.get('/v1/users/:userId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await client.users.fetch(req.params.userId, { force: true });
            if (!user) {
                res.status(404).send({
                    error: "User not found!"
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
                                res.status(200).send({
                                    error: "User banner not found!"
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
                                res.status(404).send({
                                    error: "User avatar decoration not found!"
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
                                client.guilds.fetch(process.env.BASE_GUILD as string).then(async(guild) => {
                                    let member = guild.members.cache.get(user.id)
                                    if (member) {

                                        let { status, activities, clientStatus } = member.presence as Presence;

                                        res.status(200).send({
                                            status, activities, clientStatus
                                        });
                                    } else {
                                        res.status(404).send({
                                            error: "User presence not found!"
                                        });
                                    }
                                });
                            } catch (error) {
                                res.status(404).send({
                                    error
                                });
                            }
                            break;
                        case "badges":
                            // @ts-ignore
                            res.send(getFlags(user.flags.toArray()));
                            break;
                        case "all":
                            getAllUserData(res, client, user);
                            break;
                        case "withoutPresence":
                            let badges: string[] = [];
                            let avatarURL: string = "";
                            let bannerURL: string = "";
                            let avatarDecorationURL: string = "";

                            let data = { ...user, badges, avatarURL, bannerURL, avatarDecorationURL, presence: {} };

                            if (user.flags) data.badges = getFlags(user.flags.toArray());
                            // @ts-ignore
                            if (user.avatarURL({ size: 4096 })) data.avatarURL = user.avatarURL({ size: 4096 });
                            // @ts-ignore
                            if (user.bannerURL({ size: 4096 })) data.bannerURL = user.bannerURL({ size: 4096 });
                            // @ts-ignore
                            if (user.avatarDecorationURL({ size: 4096 })) data.avatarDecorationURL = user.avatarDecorationURL({ size: 4096 });

                            res.status(200).send({
                                ...data
                            });
                            break;
                        default:
                            getAllUserData(res, client, user);
                            break;
                    }
                } else {
                    getAllUserData(res, client, user);
                }
            }
    } catch {
        const error: CustomError = new Error('Invalid ID');
        error.status = 404;
        error.name = 'NotFoundError';
        return next(error);
    }
});

app.get('/v1/docs', async (req, res) => {
    try {
        let versions = await fetch('https://raw.githubusercontent.com/hitomihiumi/docsholder/master/packages/versions.json');
        let data = await versions.json();

        if (!Array.isArray(data.modules)) {
            throw new Error('data.modules is not an array');
        }

        let docs = [] as Array<Documentation>;

        if (!(v_1.compareVersions(data))) {
            let diff = v_1.diffVersions(data);
            for (let module of diff.modules) {
                if (!Array.isArray(data.versions[module])) {
                    throw new Error(`data.versions[${module}] is not an array`);
                }

                for (const version of data.versions[module]) {
                    let raw = await fetch(`https://raw.githubusercontent.com/hitomihiumi/docsholder/master/packages/${module}/${version}.json`);
                    let data = await raw.json() as Documentation;
                    await v_1.write(data);
                    docs.push(data);
                }
            }
        } else {
            for (const module of data.modules) {
                if (!Array.isArray(data.versions[module])) {
                    throw new Error(`data.versions[${module}] is not an array`);
                }

                for (const version of data.versions[module]) {
                    let data = await v_1.read(module, version);
                    docs.push(data);
                }
            }
        }

        docs = sortPackages(docs);
        res.status(200).send(docs);
    } catch (error: any) {
        console.error(error);
        res.status(500).send({ error: error.message });
    }
});

app.get('/v1/docs/:module/:version', async (req, res) => {
    try {

        let docs: Documentation;

        if (v_1.versions.modules.includes(req.params.module) && v_1.versions.versions[req.params.module].includes(req.params.version)) {
            docs = await v_1.read(req.params.module, req.params.version);
        } else {
            let raw = await fetch(`https://raw.githubusercontent.com/hitomihiumi/docsholder/master/packages/${req.params.module}/${req.params.version}.json`);
            docs = await raw.json();
            await v_1.write(docs);
        }

        res.status(200).send(docs);
    } catch (error: any) {
        console.error(error);
        res.status(500).send({ error: error.message });
    }
});

app.get('/v2/', (req, res) => {
    res.status(200).send({
        version: info.version,
        message: "Discord-Web-API is running!",
        endpoints: {
            docs: {
                get: "/v2/docs"
            },
            steam: {
                user: {
                    get: "/v2/steam/user/:userId",
                    games: {
                        get: "/v2/steam/user/:userId/games",
                        achievements: {
                            get: "/v2/steam/user/:userId/games/achievements/:appId"
                        },
                        recently: {
                            get: "/v2/steam/user/:userId/games/recently"
                        }
                    }
                }
            }
        }
    });
});

app.get('/v2/docs', async (req, res) => {
    try {
        let versions = await fetch('https://raw.githubusercontent.com/NMMTY/docsholder/master/packages/versions.json');
        let data = await versions.json();

        if (!Array.isArray(data.modules)) {
            throw new Error('data.modules is not an array');
        }

        let docs = [] as Array<Documentation>;

        if (!(v_2.compareVersions(data))) {
            let diff = v_2.diffVersions(data);
            for (let module of diff.modules) {
                if (!Array.isArray(data.versions[module])) {
                    throw new Error(`data.versions[${module}] is not an array`);
                }

                for (const version of data.versions[module]) {
                    let raw = await fetch(`https://raw.githubusercontent.com/NMMTY/docsholder/master/packages/${module}/${version}.json`);
                    let data = await raw.json() as Documentation;
                    await v_2.write(data);
                    docs.push(data);
                }
            }
        } else {
            for (const module of data.modules) {
                if (!Array.isArray(data.versions[module])) {
                    throw new Error(`data.versions[${module}] is not an array`);
                }

                for (const version of data.versions[module]) {
                    docs.push(await v_2.read(module, version));
                }
            }
        }

        docs = sortPackages(docs);
        res.status(200).send(docs);
    } catch (error: any) {
        console.error(error);
        res.status(500).send({ error: error.message });
    }
});

app.get('/v2/docs/:module/:version', async (req, res) => {
    try {

        let docs: Documentation;

        if (v_2.versions.modules.includes(req.params.module) && v_2.versions.versions[req.params.module].includes(req.params.version)) {
            docs = await v_2.read(req.params.module, req.params.version);
        } else {
            let raw = await fetch(`https://raw.githubusercontent.com/NMMTY/docsholder/master/packages/${req.params.module}/${req.params.version}.json`);
            docs = await raw.json();
            await v_2.write(docs);
        }

        res.status(200).send(docs);
    } catch (error: any) {
        console.error(error);
        res.status(500).send({ error: error.message });
    }
});

app.get('/v2/steam/user/:userId', async (req, res) => {
    try {
        let data = await fetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.STEAM_API_KEY}&steamids=${req.params.userId}&format=json`);

        let user = await data.json();

        res.status(200).send(await extendProfile(user));
    } catch (error: any) {
        console.error(error);
        res.status(500).send({ error: error.message });
    }
});

app.get('/v2/steam/user/:userId/games', async (req, res) => {
    try {
        let data = await fetch(`http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${process.env.STEAM_API_KEY}&steamid=${req.params.userId}&format=json`);

        let games = await data.json();

        res.status(200).send(processResponse(games));
    } catch (error: any) {
        console.error(error);
        res.status(500).send({error: error.message});
    }
});

app.get('/v2/steam/user/:userId/games/stats/:appId', async (req, res) => {
    try {
        let data = await fetch(`http://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v0002/?appid=${req.params.appId}&key=${process.env.STEAM_API_KEY}&steamid=${req.params.userId}&format=json`);

        let stats = await data.json();

        res.status(200).send(stats);
    } catch (error: any) {
        console.error(error);
        res.status(500).send({error: error.message});
    }
});

app.get('/v2/steam/user/:userId/games/achievements/:appId', async (req, res) => {
    try {
        let data = await fetch(`http://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=${req.params.appId}&key=${process.env.STEAM_API_KEY}&steamid=${req.params.userId}&format=json`);

        let achievements = await data.json();

        res.status(200).send(achievements);
    } catch (error: any) {
        console.error(error);
        res.status(500).send({error: error.message});
    }
});

app.get('/v2/steam/user/:userId/games/recently', async (req, res) => {
    try {
        let data = await fetch(`http://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${process.env.STEAM_API_KEY}&steamid=${req.params.userId}&format=json`);

        let games = processResponse(await data.json());

        res.status(200).send(games);
    } catch (error: any) {
        console.error(error);
        res.status(500).send({error: error.message});
    }
});

app.get('/v2/steam/game/icon/:appId', async (req, res) => {
    try {
        let data = await fetch(`https://www.steamgriddb.com/api/v2/icons/steam/${req.params.appId}`, {
            headers: {
                Authorization: `Bearer ${process.env.STEAM_GRID_API_KEY}`
            }
        })

        let grid = await data.json();

        res.status(200).send(grid.data[0].thumb);
    } catch (error: any) {
        console.error(error);
        res.status(500).send({error: error.message});
    }
})

app.get('/v2/steam/game/grid/:appId', async (req, res) => {
    try {
        let data = await fetch(`https://www.steamgriddb.com/api/v2/grids/steam/${req.params.appId}`, {
            headers: {
                Authorization: `Bearer ${process.env.STEAM_GRID_API_KEY}`
            }
        })

        let grid = await data.json();

        res.status(200).send(grid.data[0].thumb);
    } catch (error: any) {
        console.error(error);
        res.status(500).send({error: error.message});
    }
})

app.get('/v2/steam/game/logo/:appId', async (req, res) => {
    try {
        let data = await fetch(`https://www.steamgriddb.com/api/v2/logos/steam/${req.params.appId}`, {
            headers: {
                Authorization: `Bearer ${process.env.STEAM_GRID_API_KEY}`
            }
        })

        let grid = await data.json();

        res.status(200).send(grid.data[0].thumb);
    } catch (error: any) {
        console.error(error);
        res.status(500).send({error: error.message});
    }
})

app.use((err: CustomError, req: Request, res: Response, next: NextFunction) => {
    webhookClient.send({
        embeds: [
            new EmbedBuilder()
                .setTitle('Error')
                .setDescription(`\`\`\`json\n${JSON.stringify(err, null, 2)}\n\`\`\``)
                .setColor('Red')
        ]
    })
    console.error(err.message);
    if (err.status === 404) {
        return res.status(404).send({ error: 'Not Found' });
    }
    res.status(500).send({ error: 'Internal Server Error' });
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
  console.log(`Discord-Web-API v${info.version}`);
  console.log(`http://localhost:${process.env.PORT || 3000}`);
});

client.login(process.env.TOKEN);