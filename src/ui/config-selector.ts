import { LitElement, css, html } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { consume } from '@lit/context';
import '@material/web/dialog/dialog';
import { MdDialog } from '@material/web/dialog/dialog';
import { Cloudbackup, cloudbackupContext } from '../core/cloudbackup-context';
import { SnapshotlistLoadedEvent } from '../core/snapshotlist-loaded-event';
import { NotificationEvent } from './notification-event';
import "./barcode-detector/barcode-detector";
import { BarcodeDetectorUI } from './barcode-detector/barcode-detector';
import { BarcodeDetectedEvent } from './barcode-detector/barcode-detected-event';
import { cloudUploadIcon, qrCodeScannerIcon } from './icons';

@customElement("config-selector")
export class ConfigSelector extends LitElement {
  @consume({ context: cloudbackupContext })
  cloudbackup: Cloudbackup;

  @query("md-dialog")
  private _qrDetectorDialog: MdDialog;

  @query("barcode-detector")
  private _barcodeDetector: BarcodeDetectorUI;

  static styles = css`
    :host {
      display: flex;
    }

    input[type="file"] {
      display: none;
    }

    .input-config {
      flex: 4;
      cursor: pointer;
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

    .or-divider {
      flex: 1;
      display: grid;
      text-align: center;
      align-items: center;
    }

    barcode-detector {
      width: 512px;
    }
  `;

  // Render the UI as a function of component state
  render() {
    return html`
    <input type="file" id="file-loader" @change=${this._loadConfigFromFile} accept="application/json" />
    <label for="file-loader"  class="input-config" @drop=${this._dropHandler}  @dragover=${this._dragOverHandler}>
      <div>Drag &amp; drop or click to choose the config file</div>
      <div>${cloudUploadIcon}</div>
    </label>
    <div class="or-divider">or</div>
    <div class="input-config" @click=${this._showQrDetectorDialog}>
      <div>Scan QR code</div>
      <div>${qrCodeScannerIcon}</div>
    </div>
    ${this._renderQrDetectorDialog()}
    `;
  }

  private _showQrDetectorDialog(evt: Event) {
    this._barcodeDetector.startDetection();
    this._qrDetectorDialog.show();
    evt.preventDefault();
  }

  private _renderQrDetectorDialog() {
    return html`<md-dialog @close=${(e: Event) => {
      this._barcodeDetector.stopDetection();
    }}>
      <div slot="headline">QR Scanner</div>
      <form slot="content" method="dialog">
        <barcode-detector @barcode-detected=${this._loadConfigFromQrCode}></barcode-detector>
      </form>
      <div slot="actions">
        
      </div>
    </md-dialog>`;
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
        await this.cloudbackup.loadConfigFromFile(configFile);
        this.dispatchEvent(new SnapshotlistLoadedEvent());
      }
    } catch (error) {
      const notification = new NotificationEvent(error);
      notification.toErrorConsole();
      this.dispatchEvent(notification);
    }
  }

  private async _loadConfigFromFile(evt: Event) {
    const configFile = (evt.target as HTMLInputElement).files[0];
    try {
      await this.cloudbackup.loadConfigFromFile(configFile);
      this.dispatchEvent(new SnapshotlistLoadedEvent());
    } catch (error) {
      const notification = new NotificationEvent(error);
      notification.toErrorConsole();
      this.dispatchEvent(notification);
    }
  }

  private async _loadConfigFromQrCode(evt: BarcodeDetectedEvent) {
    if (evt.barcode.rawValue !== "") {
      try {
        await this.cloudbackup.loadConfigFromString(evt.barcode.rawValue!);
        this._qrDetectorDialog.close();
        this.dispatchEvent(new SnapshotlistLoadedEvent());
      } catch (error) {
        console.log("Unrecongnized QR code", error);
      }
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "config-selector": ConfigSelector;
  }
}