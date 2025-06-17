interface Cta {
  name: string;
  link: string;
}

interface VersionPolicy {
  minimum_supported: string;
  latest_stable: string;
  blocked: string[];
}

interface MaintenanceMode {
  title: string;
  message: string;
}

interface Announcement {
  title: string;
  description: string;
  cta: Cta;
}

interface ResourceLinks {
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
