import * as v from "valibot";
import { base64ToBytes } from "./utilities/base64";
import { AwsS3, OptionsSchema } from "./cloudfs/awss3";
import { decompress } from "./utilities/compression";
import { decrypt, importKey } from "./crypto";
import { Folder, FolderSchema } from "./snapshot";
import { SnapshotList, SnapshotListSchema } from "./snapshotlist";

export const ConfigSchema = v.object({
  localPath: v.string(),
  key: v.string(),
  storage: OptionsSchema
});

type Config = v.InferInput<typeof ConfigSchema>;

export class Cloudbackup {

  private _cloudStorage: AwsS3;
  private _snapshotList: SnapshotList | null = null;
  private _snapshots = new Map<string, Folder | null>();

  loadConfigFromFile(configFile: File) {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const config = v.parse(ConfigSchema, JSON.parse(reader.result as string));
          await this.loadSnapshotList(config);
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsText(configFile);
    });
  }

  async loadConfigFromString(configString: string) {
    const config = v.parse(ConfigSchema, JSON.parse(configString));
    await this.loadSnapshotList(config);
  }

  private async loadSnapshotList(config: Config) {
    const snapshotListFile = "s/list.json";
    this._cloudStorage = new AwsS3(config.storage);

    // snapshot list
    const response = await this._cloudStorage.read(snapshotListFile);
    const fileContent = await decrypt(await importKey(base64ToBytes(config.key)), response.buffer);
    const decoder = new TextDecoder();
    const str = decoder.decode(fileContent);
    this._snapshotList = v.parse(SnapshotListSchema, JSON.parse(str));
  }

  getSnapshotList(): string[] {
    if (!this._snapshotList)
      return [];
    return this._snapshotList.snapshots.map(snapshot => snapshot.file);
  }

  async getFolder(snapshot: string, path: string): Promise<Folder> {
    const emptyFolder = <Folder>{
      n: "",
      d: [],
      f: []
    };
    if (!this._snapshotList || snapshot === "") {
      return emptyFolder;
    }
    const folders = path.split("/");
    let currentFolder = this._snapshots.get(snapshot);
    if (!currentFolder) {
      //find snapshot index
      const snapshotInfo = this._snapshotList.snapshots.find(snapshopInfo => snapshopInfo.file === snapshot);
      if (!snapshotInfo) {
        return emptyFolder;
      }

      const response = await this._cloudStorage.read("s/" + snapshotInfo.file + ".json");
      const fileContent = await decrypt(await importKey(base64ToBytes(snapshotInfo.key)), response.buffer);
      const decompressed = await decompress(new Blob([fileContent]));
      const decoder = new TextDecoder();
      const str = decoder.decode(await decompressed.arrayBuffer());
      this._snapshots.set(snapshotInfo.file, v.parse(FolderSchema, JSON.parse(str)));
      currentFolder = this._snapshots.get(snapshot);

    }
    while (folders.length > 0) {
      const currentFolderName = folders.shift();
      if (currentFolderName === "") {
        continue;
      }

      currentFolder = currentFolder.d?.find((folder: Folder) => currentFolderName === folder.n);
    }
    return currentFolder;
  }

  async downloadFile(path: string, key: string): Promise<Blob> {
    const response = await this._cloudStorage.read("b/" + path);
    const fileContent = await decrypt(await importKey(base64ToBytes(key)), response.buffer);
    return new Blob([fileContent], { type: "application/octet-stream" });
  }
}