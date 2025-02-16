export interface Versions {
    modules: string[];
    versions: VersionElement;
}

export interface VersionElement {
    [key: string]: string[];
}

export interface SteamResponse {
    response: {
        total_count: number;
        games: SteamGame[];
    }
}

export interface SteamGame {
    appid: number;
    name: string;
    playtime_forever: number;
    playtime_2weeks: number;
    img_icon_url: string;
    playtime_windows_forever: number;
    playtime_mac_forever: number;
    playtime_linux_forever: number;
    playtime_deck_forever: number;
}

export interface ExtendedSteamResponse {
    response: {
        total_count: number;
        games: ExtendedSteamGame[];
    }
}

export interface ExtendedSteamGame extends SteamGame {
    library_capsule: string;
    library_capsule_2x: string;
    library_header: string;
    library_header_2x: string;
    library_logo: string;
    library_logo_2x: string;
    library_hero: string;
    library_hero_2x: string;
}