import { LitElement, css, html, nothing } from 'lit';
import { until } from 'lit/directives/until.js';
import { consume } from '@lit/context';
import { customElement, property } from 'lit/decorators.js';
import "@material/web/list/list";
import "@material/web/list/list-item";
import { MdListItem } from '@material/web/list/list-item';
import "@material/web/button/text-button";
import { CryptoFile, Folder } from '../core/snapshot';
import { Cloudbackup, cloudbackupContext } from '../core/cloudbackup-context';
import { NotificationEvent } from './notification-event';
import { draftIcon, folderIcon, homeIcon, keyboardArrowRightIcon, topicIcon } from './icons';
import { downloadBlobAsFile } from '../core/utilities/download';

@customElement("snapshot-viewer")
export class SnapshotViewer extends LitElement {
  @consume({ context: cloudbackupContext })
  cloudbackup: Cloudbackup;

  @property()
  snapshot = "-";

  @property()
  path = "";

  override connectedCallback(): void {
    super.connectedCallback();

    window.onhashchange = () => {
      if (window.location.hash === "") {
        this.snapshot = "";
        this.path = "";
      } else {
        const hash = decodeURI(window.location.hash.substring(1));
        [this.snapshot, this.path] = hash.split(":");
      }
    };
  }

  static styles = css`
    :host {
      display: block;
    }
  `;

  render() {
    return html`
    ${this._breadcrumbs(this.snapshot, this.path)}

    <md-list id="content">
      ${this.snapshot === "" ? this._snapshotList() : until(this._folderContentList(), html`<md-list-item>Loading...</md-list-item>`)}
    </md-list>
    `;
  }

  private _snapshotList() {
    return html`
      ${this.cloudbackup.getSnapshotList().map(snapshot => html`<md-list-item type="link" href="#${snapshot}:">${topicIcon}${snapshot}</md-list-item>`)}
    `;
  }

  private async _folderContentList() {
    try {
      const folder = await this.cloudbackup.getFolder(this.snapshot, this.path);
      return html`
        ${folder.d?.map((folder: Folder) => html`<md-list-item type="link" href="#${this._fullPath(folder.n)}">${folderIcon}${folder.n}</md-list-item>`)}
        ${folder.f?.map((file: CryptoFile) => html`<md-list-item type="button" href="#${this._fullPath(file.n)}" @click="${(evt: PointerEvent) => this._downloadFile(evt)}" data-filename="${file.n}" data-key="${file.k}" data-blob="${file.b}">${draftIcon}<div slot="headline">${file.n}</div><div slot="supporting-text">${this._formatFileSize(file.s)} - ${new Date(file.t).toLocaleString()}</div></md-list-item>`)}
      `;
    } catch (error) {
      const notification = new NotificationEvent(error);
      notification.toErrorConsole();
      this.dispatchEvent(notification);
    }
  }

  private _formatFileSize(size: number): string {
    const sizes = ["B", "KB", "MB", "GB", "TB", "PB"];
    for (let i = 0; i < sizes.length; i++) {
      if (size < Math.pow(1024, i + 1)) {
        return (size / Math.pow(1024, i)).toFixed(i > 1 ? 2 : 0) + " " + sizes[i];
      }
    }
  }

  private _fullPath(name: string): string {
    if (this.path === "") {
      return this.snapshot + ":" + name;
    }

    return this.snapshot + ":" + this.path + "/" + name;
  }

  private _breadcrumbs(snapshot: string, path: string) {
    const crumbs = path === "" ? [] : path.split("/");

    return html`<div id="breadcrumbs" style="display:flex; align-items: center;">
      <md-text-button href="#">${homeIcon}</md-text-button>
      ${snapshot !== "" ? html`${keyboardArrowRightIcon} <md-text-button href="#${snapshot}:">${snapshot}</md-text-button>` : nothing}
      ${crumbs.map((crumb, i) => html` ${keyboardArrowRightIcon} <md-text-button href="#${snapshot}:${crumbs.slice(0, i + 1).join("/")}">${crumb}</md-text-button>`)}
    </div>`;
  }

  private async _downloadFile(evt: PointerEvent) {
    evt.preventDefault();
    const target = evt.currentTarget as MdListItem;
    try {
      const blob = await this.cloudbackup.downloadFile(target.dataset.blob, target.dataset.key);
      downloadBlobAsFile(blob, target.dataset.filename);
    } catch (error) {
      const notification = new NotificationEvent(error);
      notification.toErrorConsole();
      this.dispatchEvent(notification);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "snapshot-viewer": SnapshotViewer;
  }
}