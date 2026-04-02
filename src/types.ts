export type Platform = "v1" | "v0";

export type Region = "US" | "EU";

export interface Config {
  apiToken: string;
  tenantId: string;
  platform: Platform;
  region: Region;
  baseUrl: string;
}

export interface ToolMeta {
  name: string;
  description: string;
  tags: string[];
  method: string;
  pathTemplate: string;
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
