export interface Memory {
  id: string;
  name: string;
  description: string | null;
  metadata_fields: Record<string, any>;
  source: string | null;
  source_id: string | null;
  source_ref: string | null;
  object_ref: string;
  version: number;
  shard_id: string;
  document_type_id: string;
  signed_url: string | null;
  annotations: any[];
  created_at: string;
  file_format: string;
  added_by: string;
  contributor_details: Record<string, any>;
}

export type MemoryParams = {
  search?: string;
  records_per_page?: number;
  page?: number;
  sort?: string;
  signed_url?: boolean;
};
