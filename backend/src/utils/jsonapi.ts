import { Document, Types } from 'mongoose';
import { UrlResource, VisitResource, ApiResponse } from '../types/url';
import crypto from 'crypto';
import { FlattenMaps } from 'mongoose';
import { IUrl } from '@models/Url';

// Format URL resources according to JSON:API spec
export function formatUrlResource(
  host: string,
  url: (Document<unknown, any, IUrl> & IUrl) | FlattenMaps<IUrl> & { _id: Types.ObjectId },
  includeRelationships = true
): UrlResource {
  const urlObj = url instanceof Document
    ? url.toObject() : url;

  const resource: UrlResource = {
    type: 'urls',
    id: urlObj._id.toString(),
    attributes: {
      host,
      originalUrl: urlObj.originalUrl,
      shortId: urlObj.shortId,
      clicks: urlObj.clicks,
      createdAt: urlObj.createdAt.toISOString(),
      updatedAt: urlObj.updatedAt.toISOString()
    },
    relationships: {
      user: {
        data: {
          type: 'users',
          id: ''
        }
      },
      visits: undefined
    }
  };

  if (includeRelationships) {
    resource.relationships = {
      user: {
        data: {
          type: 'users',
          id: urlObj.user.toString()
        }
      }
    };
  }

  if (urlObj.meta) {
    resource.attributes.meta = urlObj.meta;
  }

  return resource;
}

// Format visit resources
export function formatVisitResource(visit: any): VisitResource {
  return {
    type: 'visits',
    id: visit._id.toString(),
    attributes: {
      timestamp: visit.timestamp.toISOString(),
      referrer: visit.referrer,
      country: visit.country,
      deviceType: visit.deviceType,
      browser: visit.browser,
      os: visit.os
    }
  };
}

// Format error responses
export function formatErrorResponse(
  status: number,
  title: string,
  detail: string,
  code?: string,
  source?: { pointer?: string; parameter?: string }
): ApiResponse<never> {
  return {
    errors: [{
      id: crypto.randomUUID(),
      status: status.toString(),
      code: code || 'ERR_UNKNOWN',
      title,
      detail,
      source
    }]
  };
}

// Format success response with included resources
export function formatResponse<T>(
  data: T,
  included: any[] = [],
  links?: any,
  meta?: any
): ApiResponse<T> {
  return {
    data,
    included,
    links,
    meta
  };
}