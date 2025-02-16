import { Activity, Client, User, UserFlagsString } from "discord.js";
import { Response } from 'express';
import { Documentation } from "@hitomihiumi/micro-docgen";
import {ExtendedSteamProfile, ExtendedSteamResponse, ExtendedSteamUsers, SteamResponse, SteamUsers} from "./types";
import axios from 'axios';
import * as cheerio from 'cheerio';

function getFlags(flags: UserFlagsString[]) {
    let badges: string[] = [];

    flags.forEach((flag) => {
        switch (flag) {
            case "Staff":
                badges.push("Discord Employee");
                break;
            case "Partner":
                badges.push("Partnered Server Owner");
                break;
            case "BugHunterLevel1":
                badges.push("Bug Hunter Level 1");
                break;
            case "BugHunterLevel2":
                badges.push("Bug Hunter Level 2");
                break;
            case "HypeSquadOnlineHouse1":
                badges.push("House of Bravery");
                break;
            case "HypeSquadOnlineHouse2":
                badges.push("House of Brilliance");
                break;
            case "HypeSquadOnlineHouse3":
                badges.push("House of Balance");
                break;
            case "PremiumEarlySupporter":
                badges.push("Early Supporter");
                break;
            case "VerifiedDeveloper":
                badges.push("Verified Developer");
                break;
            case "ActiveDeveloper":
                badges.push("Active Developer");
                break;
            case "CertifiedModerator":
                badges.push("Certified Moderator");
                break;
            case "VerifiedBot":
                badges.push("Verified Bot");
                break;
        }
    });

    return badges;
}

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

function getAllUserData(res: Response, client: Client, user: User) {
    let badges: string[] = [];
    let avatarURL: string = "";
    let bannerURL: string = "";
    let avatarDecorationURL: string = "";
    let presence: any = {};

    let data = { ...user, badges, avatarURL, bannerURL, avatarDecorationURL, presence };

    if (user.flags) data.badges = getFlags(user.flags.toArray());
    // @ts-ignore
    if (user.avatarURL({ size: 4096 })) data.avatarURL = user.avatarURL({ size: 4096 });
    // @ts-ignore
    if (user.bannerURL({ size: 4096 })) data.bannerURL = user.bannerURL({ size: 4096 });
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
                        if (activity.assets) {
                            activity.assets.largeImage = activity.assets.largeImageURL();
                            activity.assets.smallImage = activity.assets.smallImageURL();
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

function sortPackages(docs: Array<Documentation>): Array<Documentation> {
    return docs.sort((a, b) => b.metadata.timestamp - a.metadata.timestamp);
}

function excludeGame(response: SteamResponse): SteamResponse {
    if (process.env.EXCLUDED_GAMES) {
        // @ts-ignore
        response.response.games = response.response.games.filter((game) => !(process.env.EXCLUDED_GAMES.split(',').map((value) => Number(value)).includes(game.appid)));
        response.response.total_count = response.response.games.length;
    }
    return response;
}

async function extendProfile(response: SteamUsers): Promise<ExtendedSteamUsers> {
    let newRes: ExtendedSteamUsers = {
        response: {
            players: []
        }
    }
    for (const player of response.response.players) {
        const { data } = await axios.get(player.profileurl);
        const $ = cheerio.load(data);

        let profile: ExtendedSteamProfile = {
            ...player,
            background: $('.profile_background_image').children('video').attr('poster') || $('.profile_animated_background').children('video').attr('poster') || null,
            frame: $('.profile_avatar_frame').children('img').attr('src') || null
        }

        newRes.response.players.push(profile);
    }

    return newRes;
}

function extendResponce(response: SteamResponse): ExtendedSteamResponse {
    let newRes: ExtendedSteamResponse = {
        response: {
            total_count: response.response.total_count,
            games: []
        }
    }

    response.response.games.forEach((game) => {
        newRes.response.games.push({
            ...game,
            library_capsule: `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/library_600x900.jpg`,
            library_capsule_2x: `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/library_600x900_2x.jpg`,
            library_header: `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`,
            library_header_2x: `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header_2x.jpg`,
            library_logo: `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/logo.png`,
            library_logo_2x: `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/logo_2x.png`,
            library_hero: `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/library_hero.jpg`,
            library_hero_2x: `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/library_hero_2x.jpg`
        });
    });

    return newRes;
}

function processResponse(response: SteamResponse): ExtendedSteamResponse {
    return extendResponce(excludeGame(response));
}

export { getFlags, getSize, getAllUserData, sortPackages, excludeGame, extendResponce, processResponse, extendProfile };