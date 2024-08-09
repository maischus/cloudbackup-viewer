import * as v from "valibot";

export const CryptoFileSchema = v.object({
  n: v.string(), // name
  t: v.string(), // mod time
  s: v.number(), // size
  h: v.string(), // hash
  b: v.string(), // blob
  k: v.string(), // key
});

export type CryptoFile = v.InferInput<typeof CryptoFileSchema>;

export const FolderSchema = v.object({
  n: v.string(), // name
  d: v.optional(v.array(v.lazy(() => FolderSchema))), // folders
  f: v.optional(v.array(CryptoFileSchema)) // files
});

export type Folder = v.InferInput<typeof FolderSchema>;