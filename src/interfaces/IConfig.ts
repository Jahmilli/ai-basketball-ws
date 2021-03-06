export interface IS3Config {
  videosBucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  endpoint: string;
  sslEnabled: boolean;
  s3ForcePathStyle: boolean;
}

export interface IApiConfig {
  port: number;
}

export interface IPoseServiceConfig {
  endpoint: string;
  path: string;
  timeout: number;
}

export interface IConfig {
  s3: IS3Config;
  api: IApiConfig;
  poseService: IPoseServiceConfig;
}
