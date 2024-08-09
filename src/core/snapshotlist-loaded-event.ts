export class SnapshotlistLoadedEvent extends Event {
    public static type = "snapshotlist-loaded";
    constructor() {
        super(SnapshotlistLoadedEvent.type, { bubbles: true, composed: true });
    }
}