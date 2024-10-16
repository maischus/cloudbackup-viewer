import { LitElement, css, html } from 'lit';
import { provide } from "@lit/context";
import { customElement, query, state } from 'lit/decorators.js';
import { Cloudbackup, cloudbackupContext } from "./core/cloudbackup-context";
import { SnapshotlistLoadedEvent } from './core/snapshotlist-loaded-event';
import "./ui/config-selector";
import "./ui/snapshot-viewer";
import { SnapshotViewer } from './ui/snapshot-viewer';
import { NotificationEvent } from './ui/notification-event';


@customElement("cloudbackup-web")
export class App extends LitElement {

  static styles = css`
    header {
      background-color: var(--md-sys-color-surface);
      padding: var(--size-fluid-2);
      margin-block-end: var(--size-fluid-2);

      & h1 {
        font-family: var(--md-ref-typeface-brand);
        margin: 0;
      }
    }

    config-selector, snapshot-viewer {
      margin-inline: var(--size-fluid-2);
    }

    #notification-container {
      position: fixed;
      display: grid;
      z-index: 1;
      inset-inline-end: 0;
      inset-block-start: 0;
      padding-block-start: 5vh;
      gap: 10px;
    }

    output {
        background-color: var(--red-7);
        color: var(--gray-3);
        max-inline-size: min(25ch, 90vw);
        padding-block: var(--size-3);;
        padding-inline: var(--size-4);;
        border-top-left-radius: var(--radius-2);
        border-bottom-left-radius: var(--radius-2);
        box-shadow: var(--shadow-5);
        cursor: pointer;
        animation: slide-in 1s;
      }

    @keyframes slide-in {
      from { transform: translateX(100%); }
    }
  `;

  @provide({ context: cloudbackupContext })
  cloudbackup = new Cloudbackup();

  @state()
  private _notifications: NotificationEvent[] = [];

  @query("snapshot-viewer")
  private _snapshotViewer: SnapshotViewer;

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener(SnapshotlistLoadedEvent.type, () => {
      this.shadowRoot.querySelector("config-selector").style.display = "none";
      this._snapshotViewer.style.display = "block";
      window.location.hash = "";
      this._snapshotViewer.snapshot = "";
      this._snapshotViewer.path = "";
    });

    this.addEventListener(NotificationEvent.type, (evt: NotificationEvent) => {
      this._notifications = [...this._notifications, evt];
    });
  }

  render() {
    return html`
    <header><h1>CloudBackup Viewer</h1></header>
    <div id="notification-container">
      ${this._notifications.map((notification, idx) => html`<output role="status" data-idx="${idx}" @click=${this._closeNotification}>${notification.error}</output>`)}
    </div>
    <config-selector></config-selector>
    <snapshot-viewer style="display: none"></snapshot-viewer>
    `;
  }

  private _closeNotification(evt: PointerEvent) {
    const idx = Number((evt.target as HTMLOutputElement).dataset.idx);
    this._notifications = [...this._notifications.slice(0, idx), ...this._notifications.slice(idx + 1)];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "cloudbackup-web": App;
  }
}