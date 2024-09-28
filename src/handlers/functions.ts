import { Activity, UserFlagsString, Client, User } from "discord.js";
import { Response } from 'express';
import { Documentation } from "@hitomihiumi/micro-docgen";

function isUrl(url: string) {
    if (url.match(/(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)/g)) {
        return true;
    } else {
        return false;
    }
}

function assetsURL(activity: Activity, data: { largeImageURL: string, smallImageURL: string }) {
    if (activity.assets) {
        if (activity.assets.largeImage && !isUrl(activity.assets.largeImage))
            data["largeImageURL"] = `https://cdn.discordapp.com/app-assets/${activity.applicationId}/${activity.assets.largeImage}.png`;
        if (activity.assets.smallImage && !isUrl(activity.assets.smallImage))
            data["smallImageURL"] = `https://cdn.discordapp.com/app-assets/${activity.applicationId}/${activity.assets.smallImage}.png`;
        return data;
    } else {
        return data;
    }
}

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
                        let assets = { largeImageURL: "", smallImageURL: "" }
                        // @ts-ignore
                        assets = assetsURL(activity, assets);

                        if (activity.assets) {
                            if (assets.largeImageURL.length > 0) {
                                activity.assets.largeImage = assets.largeImageURL;
                            }
                            if (assets.smallImageURL.length > 0) {
                                activity.assets.smallImage = assets.smallImageURL;
                            }
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

export { assetsURL, getFlags, getSize, getAllUserData, sortPackages };