export class UpdateOCCFileSettings {
  environmentPrefix!: string;
  OCCRootPath!: string;
  terminalType?: string;

  constructor(json?: any) {
    if (json !== null) {
      this.environmentPrefix = json.environmentPrefix;
      this.OCCRootPath = json.OCCRootPath;
      this.terminalType = json.terminalType ? json.terminalType : null;
    }
  }
}