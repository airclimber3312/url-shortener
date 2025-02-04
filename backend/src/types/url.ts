/**
 * Represents a shortened URL entity
 */
export interface ShortenedUrl {
  id: string;
  originalUrl: string;
  shortId: string;
  userId: string;
  clicks: number;
  createdAt: Date;
  updatedAt: Date;
  meta?: {
    title?: string;
    description?: string;
    favicon?: string;
  };
}

/**
 * Represents a visit/click record for a shortened URL
 */
export interface Visit {
  id: string;
  timestamp: Date;
  referrer?: string;
  country?: string;
  deviceType?: 'desktop' | 'mobile' | 'tablet';
  browser?: string;
  os?: string;
}

/**
 * JSON:API compliant response format
 */
export interface ApiResponse<T> {
  data?: T;
  included?: any[];
  links?: {
    self: string;
    next?: string;
    prev?: string;
    first?: string;
    last?: string;
  };
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
  };
  errors?: ApiError[];
}

/**
 * JSON:API compliant error format
 */
export interface ApiError {
  id?: string;
  status: string;
  code?: string;
  title: string;
  detail: string;
  source?: {
    pointer?: string;
    parameter?: string;
  };
}

/**
 * URL resource following JSON:API spec
 */
export interface UrlResource {
  type: 'urls';
  id: string;
  attributes: {
    host: string;
    originalUrl: string;
    shortId: string;
    clicks: number;
    createdAt: string;
    updatedAt: string;
    meta?: {
      title?: string;
      description?: string;
      favicon?: string;
    };
  };
  relationships: {
    user: {
      data: {
        type: 'users';
        id: string;
      };
    };
    visits?: {
      data: VisitResource[];
    };
  };
  links?: {
    self: string;
    qrCode?: string;
    analytics?: string;
  };
}

/**
 * Visit resource following JSON:API spec
 */
export interface VisitResource {
  type: 'visits';
  id: string;
  attributes: {
    timestamp: string;
    referrer?: string;
    country?: string;
    deviceType?: string;
    browser?: string;
    os?: string;
  };
}

/**
 * Payload for creating a new URL
 */
export interface CreateUrlPayload {
  originalUrl: string;
  customSlug?: string;
}

/**
 * Payload for updating a URL
 */
export interface UpdateUrlPayload {
  shortId?: string;
  originalUrl?: string;
}

/**
 * Pagination parameters
 */
export interface Pagination {
  page?: number;
  pageSize?: number;
  sort?: 'createdAt' | 'clicks' | 'updatedAt';
  order?: 'asc' | 'desc';
}

/**
 * Paginated URL list response
 */
export interface PaginatedUrls {
  data: ShortenedUrl[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}