import * as fs from 'fs';
import * as path from 'path';
import { Documentation } from "@hitomihiumi/micro-docgen";
import { Versions, VersionElement } from './types';

export class Holder {
    public versions: Versions;
    public base;

    constructor(base?: string) {
        this.versions = {
            modules: [],
            versions: {} as VersionElement
        };
        this.base = base || 'v1';
    }

    public async init() {
        await this.checkFolders();
        await this.readVersions();
    }

    private async checkFolders(folder?: string) {
        if (!fs.existsSync(path.resolve(__dirname, this.base))) {
            fs.mkdirSync(path.resolve(__dirname, this.base));
        }
        if (!fs.existsSync(path.resolve(__dirname, this.base, 'docs'))) {
            fs.mkdirSync(path.resolve(__dirname, this.base, 'docs'));
        }
        if (!fs.existsSync(path.resolve(__dirname, this.base, 'docs', 'versions.json'))) {
            fs.writeFileSync(path.resolve(__dirname, this.base, 'docs', 'versions.json'), '{\n\t"modules": [],\n\t"versions": {}\n}');
        }
        if (folder) {
            if (!fs.existsSync(path.resolve(__dirname, this.base, 'docs', folder))) {
                fs.mkdirSync(path.resolve(__dirname, this.base, 'docs', folder));
            }
        }
    }

    private async readVersions() {
        let data = await fs.promises.readFile(path.resolve(__dirname, this.base, 'docs', 'versions.json'), 'utf-8');

        this.versions = JSON.parse(data);

        return this.versions;
    }

    compareVersions(ver: Versions) {
        let diff = this.diffVersions(ver);
        if (diff.modules.length === 0 && Object.keys(diff.versions).length === 0) {
            return true;
        }
        return false;
    }

    diffVersions(ver: Versions) {
        let diff = {
            modules: [],
            versions: {}
        } as Versions;

        for (let module of ver.modules) {
            if (!this.versions.modules.includes(module)) {
                diff.modules.push(module);
            }
        }

        for (let module in ver.versions) {
            if (!this.versions.versions[module]) {
                diff.versions[module] = ver.versions[module];
            } else {
                for (let version of ver.versions[module]) {
                    if (!this.versions.versions[module].includes(version)) {
                        diff.versions[module] ? diff.versions[module].push(version) : diff.versions[module] = [version];
                    }
                }
            }
        }

        return diff;
    }

    public async write(data: Documentation) {
        this.checkFolders(data.name);

        await this.readVersions();

        await fs.promises.writeFile(path.resolve(__dirname, this.base, 'docs', `${data.name}`, `${data.version}.json`), JSON.stringify(data, null, 4));

        this.versions.modules.includes(data.name) ? null : this.versions.modules.push(data.name);
        this.versions.versions[data.name] ? this.versions.versions[data.name].push(data.version) : this.versions.versions[data.name] = [data.version];

        await fs.promises.writeFile(path.resolve(__dirname, this.base, 'docs', 'versions.json'), JSON.stringify(this.versions, null, 4));

        return this.versions;
    }

    public async read(name: string, version: string) {
        let data = await fs.promises.readFile(path.resolve(__dirname, this.base, 'docs', name, `${version}.json`), 'utf-8');

        return JSON.parse(data) as Documentation;
    }
}