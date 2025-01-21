export interface Versions {
    modules: string[];
    versions: VersionElement;
}

export interface VersionElement {
    [key: string]: string[];
}