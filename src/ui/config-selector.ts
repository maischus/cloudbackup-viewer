import { LitElement, css, html } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { consume } from '@lit/context';
import "@material/web/icon/icon";
import { Cloudbackup, cloudbackupContext } from '../core/cloudbackup-context';
import { SnapshotlistLoadedEvent } from '../core/snapshotlist-loaded-event';
import { NotificationEvent } from './notification-event';

@customElement("config-selector")
export class ConfigSelector extends LitElement {
  @consume({ context: cloudbackupContext })
  cloudbackup: Cloudbackup;

  @query("video")
  video: HTMLVideoElement;

  static styles = css`
    :host {
      display: block;
    }

    input[type="file"] {
      display: none;
    }

    label {
      display: flex;
      flex-direction: column;
      align-items: center;
      
      background-color: var(--md-sys-color-surface);
      color: var(--md-sys-color-on-surface);
      border: var(--border-size-1) dashed var(--gray-5);

      border-radius: var(--radius-2);
      padding: var(--size-fluid-3);
      box-shadow: var(--shadow-2);

      & * {
        padding: 10px;
      }
    }
  `;

  // Render the UI as a function of component state
  render() {
    return html`
    <input type="file" id="file-loader" @change=${this._loadConfig} accept="application/json" />
    <label for="file-loader" @drop=${this._dropHandler}  @dragover=${this._dragOverHandler}>
      <div>Drag and drop the config file or click</div>
      <div><md-icon>cloud_upload</md-icon></div>
    </label>
    `;
  }

  private _dragOverHandler(evt: DragEvent) {
    evt.preventDefault();
  }

  private async _dropHandler(evt: DragEvent) {
    evt.preventDefault();

    try {
      let configFile: File | null = null;
      if (evt.dataTransfer.items && evt.dataTransfer.items.length > 0 && evt.dataTransfer.items[0].kind === "file") {
        configFile = evt.dataTransfer.items[0].getAsFile();
      } else if (evt.dataTransfer.files && evt.dataTransfer.files.length > 0) {
        configFile = evt.dataTransfer.files[0];
      }

      if (configFile) {
        await this.cloudbackup.loadWithConfig(configFile);
        this.dispatchEvent(new SnapshotlistLoadedEvent());
      }
    } catch (error) {
      const notification = new NotificationEvent(error);
      notification.toErrorConsole();
      this.dispatchEvent(notification);
    }
  }

  private async _loadConfig(evt: Event) {
    const configFile = (evt.target as HTMLInputElement).files[0];
    try {
      await this.cloudbackup.loadWithConfig(configFile);
      this.dispatchEvent(new SnapshotlistLoadedEvent());
    } catch (error) {
      const notification = new NotificationEvent(error);
      notification.toErrorConsole();
      this.dispatchEvent(notification);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "config-selector": ConfigSelector;
  }
}