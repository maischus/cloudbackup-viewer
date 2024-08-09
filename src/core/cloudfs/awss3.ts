
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import * as v from "valibot";

export const OptionsSchema = v.object({
  key: v.string(),
  secret: v.string(),
  endpoint: v.string(),
  bucket: v.string(),
  forcePathStyle: v.optional(v.boolean(), false)
});

type Options = v.InferInput<typeof OptionsSchema>;

export class AwsS3 {
  private _client: S3Client;
  private _bucket: string;


  constructor(opts: Options) {
    this._bucket = opts.bucket;
    this._client = new S3Client({
      region: "auto",
      endpoint: opts.endpoint,
      credentials: {
        accessKeyId: opts.key,
        secretAccessKey: opts.secret,
      },
      forcePathStyle: opts.forcePathStyle
    });
  }

  public async read(path: string): Promise<Uint8Array> {
    return new Promise(async (resolve, reject) => {
      const input = {
        "Bucket": this._bucket,
        "Key": path,
      };
      const command = new GetObjectCommand(input);

      try {
        const response = await this._client.send(command);
        const data: Uint8Array = await response.Body.transformToByteArray();

        resolve(data);
      } catch (err) {
        return reject(err);
      }
    });
  }
}