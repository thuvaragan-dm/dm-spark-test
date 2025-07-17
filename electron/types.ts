export interface Cta {
  name: string;
  link: string;
}

export interface VersionPolicy {
  minimum_supported: string;
  latest_stable: string;
  blocked: string[];
}

export interface MaintenanceMode {
  title: string;
  message: string;
}

export interface Announcement {
  title: string;
  description: string;
  cta: Cta;
}

export interface ResourceLinks {
  help_docs: string;
  privacy_policy: string;
}

export interface GlobalAppConfig {
  version_policy: VersionPolicy;
  maintenance_mode: MaintenanceMode | null;
  global_announcement: Announcement | null;
  resource_links: ResourceLinks;
}

export interface VersionAppConfig {
  version: string;
  backend_url: string;
  login_url: string;
  announcement: Announcement | null;
}

export interface AppConfiguration {
  global: GlobalAppConfig;
  version: VersionAppConfig;
}
