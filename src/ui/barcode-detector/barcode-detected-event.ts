import { DetectedBarcode } from "barcode-detector/pure";

export class BarcodeDetectedEvent extends Event {
  public static type = "barcode-detected";
  public barcode: DetectedBarcode;
  constructor(barcode: DetectedBarcode) {
    super(BarcodeDetectedEvent.type, { bubbles: true, composed: true });
    this.barcode = barcode;
  }
}