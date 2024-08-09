import * as v from "valibot";

export const SnapshotInfoSchema = v.object({
  file: v.string(),
  key: v.string()
});

export const SnapshotListSchema = v.object({
  snapshots: v.array(SnapshotInfoSchema)
});

export type SnapshotList = v.InferInput<typeof SnapshotListSchema>;