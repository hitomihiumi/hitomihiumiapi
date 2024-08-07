import { Activity, UserFlagsString } from "discord.js";

function assetsURL(activity: Activity, data: { largeImageURL: string, smallImageURL: string }) {
    if (activity.assets) {
        if (activity.assets.largeImage)
            data["largeImageURL"] = `https://cdn.discordapp.com/app-assets/${activity.applicationId}/${activity.assets.largeImage}.png`;
        if (activity.assets.smallImage)
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

export { assetsURL, getFlags, getSize };