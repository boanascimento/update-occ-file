export class UpdateOCCFileSettings {
  environmentPrefix!: string;
  OCCRootPath!: string;
  platform!: string;

  constructor(json?: any) {
    if (json !== null) {
      this.environmentPrefix = json.environmentPrefix;
      this.OCCRootPath = json.OCCRootPath;
      this.platform = json.platform;
    }
  }
}