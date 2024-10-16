import { LitElement, html, css } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { BarcodeDetector, DetectedBarcode } from "barcode-detector/pure";
import { BarcodeDetectedEvent } from './barcode-detected-event';

@customElement("barcode-detector")
export class BarcodeDetectorUI extends LitElement {

  @query("video")
  private _video: HTMLVideoElement;

  private _detectorInterval = 0;

  public async startDetection() {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: "environment" }
      },
      audio: false
    });
    this._video.srcObject = stream;
    await this._video.play();

    const barcodeDetector = new BarcodeDetector({ formats: ["qr_code"] });
    this._detectorInterval = window.setInterval(() => {
      barcodeDetector.detect(this._video)
        .then((barcodes: DetectedBarcode[]) => {
          barcodes.forEach((barcode) => this.dispatchEvent(new BarcodeDetectedEvent(barcode)));
        });
    }, 1000);
  }

  public stopDetection() {
    window.clearInterval(this._detectorInterval);
    this._video.pause();

    const tracks = (this._video.srcObject as MediaStream).getTracks();
    tracks.forEach(track => {
      track.stop();
    });
    this._video.srcObject = null;
  }

  protected render() {
    return html`<video/>`;
  }

  static styles = css`
    :host {
      display: block;
    }

    video {
      width: 100%;
      height: 100%;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "barcode-detector": BarcodeDetectorUI;
  }
}