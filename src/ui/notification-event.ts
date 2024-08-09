export class NotificationEvent extends Event {
  public static type = "notification";
  public error;
  constructor(error) {
    super(NotificationEvent.type, { bubbles: true, composed: true });
    this.error = error;
  }

  public toErrorConsole() {
    console.error(this.error);
  }
}