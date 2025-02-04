import { Request, Response } from 'express';
import { nanoid } from 'nanoid';
import Url from '../models/Url';
import User from '../models/User';
import { isValidUrl } from '../utils/validator';
import { formatUrlResource, formatErrorResponse, formatResponse } from '../utils/jsonapi';
import { rateLimiter } from '../middleware/rateLimiter';
import { authenticate } from '../middleware/auth';
import { trackVisit } from '../middleware/analytics';

// Create short URL
export const createShortUrl = async (req: Request, res: Response) => {
  try {
    const { originalUrl, customSlug } = req.body;
    const userId = req.userId;

    // Validate URL format
    if (!isValidUrl(originalUrl)) {
      return res.status(400).json(
        formatErrorResponse(400, 'Invalid URL', 'URL must be valid and include http:// or https://')
      );
    }

    // Check for existing URL
    const existingUrl = await Url.findOne({ originalUrl, user: userId });
    if (existingUrl) {
      return res.json({
        data: formatUrlResource(req.headers.host || '', existingUrl)
      });
    }

    // Generate or validate custom slug
    let shortId: string;
    if (customSlug) {
      if (!/^[a-zA-Z0-9_-]{3,20}$/.test(customSlug)) {
        return res.status(400).json(
          formatErrorResponse(400, 'Invalid Slug', 'Slug must be 3-20 alphanumeric characters')
        );
      }
      const slugExists = await Url.findOne({ shortId: customSlug });
      if (slugExists) {
        return res.status(409).json(
          formatErrorResponse(409, 'Slug Exists', 'This custom slug is already in use')
        );
      }
      shortId = customSlug;
    } else {
      shortId = nanoid(8);
    }

    // Create new URL
    const url = new Url({
      originalUrl,
      shortId,
      user: userId,
      visits: []
    });

    await url.save();

    // Update user's URLs array
    await User.findByIdAndUpdate(userId, { $push: { urls: url.id } });

    res.status(201).json({
      data: formatUrlResource(req.headers.host || '', url),
      links: {
        self: `/api/urls/${url.id}`,
        qrCode: `${process.env.BASE_URL}/${url.shortId}/qr`,
        analytics: `/api/urls/${url.id}/analytics`
      }
    });

  } catch (error) {
    res.status(500).json(
      formatErrorResponse(500, 'Server Error', 'Failed to create short URL')
    );
  }
};

// Redirect to original URL
export const redirectToUrl = [
  rateLimiter({
    max: 100,
    windowMs: 15 * 60 * 1000
  }), // 100 requests per window
  trackVisit,
  async (req: Request, res: Response) => {
    try {
      const url = await Url.findOneAndUpdate(
        { shortId: req.params.shortId },
        { $inc: { clicks: 1 } },
        { new: true }
      );

      if (!url) {
        return res.status(404).json(
          formatErrorResponse(404, 'Not Found', 'Short URL does not exist')
        );
      }

      res.redirect(url.originalUrl);
    } catch (error) {
      res.status(500).json(
        formatErrorResponse(500, 'Server Error', 'Failed to redirect')
      );
    }
  }
];

// Update URL slug
export const updateShortUrl = [
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const { newSlug } = req.body;
      const url = await Url.findById(req.params.id);

      if (!url) {
        return res.status(404).json(
          formatErrorResponse(404, 'Not Found', 'URL not found')
        );
      }

      // Verify ownership
      if (url.user.toString() !== req.userId) {
        return res.status(403).json(
          formatErrorResponse(403, 'Forbidden', 'Not authorized to modify this URL')
        );
      }

      // Validate new slug
      if (!/^[a-zA-Z0-9_-]{3,20}$/.test(newSlug)) {
        return res.status(400).json(
          formatErrorResponse(400, 'Invalid Slug', 'Slug must be 3-20 alphanumeric characters')
        );
      }

      const existingSlug = await Url.findOne({ shortId: newSlug });
      if (existingSlug) {
        return res.status(409).json(
          formatErrorResponse(409, 'Conflict', 'Slug already in use')
        );
      }

      url.shortId = newSlug;
      await url.save();

      res.json({
        data: formatUrlResource(req.headers.host || '', url),
        links: {
          self: `/api/urls/${url.id}`
        }
      });

    } catch (error) {
      res.status(500).json(
        formatErrorResponse(500, 'Server Error', 'Failed to update URL')
      );
    }
  }
];

// Get URL analytics
export const getUrlAnalytics = [
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const url = await Url.findById(req.params.id)
        .populate('visits')
        .lean();

      if (!url) {
        return res.status(404).json(
          formatErrorResponse(404, 'Not Found', 'URL not found')
        );
      }

      // Verify ownership
      if (url.user.toString() !== req.userId) {
        return res.status(403).json(
          formatErrorResponse(403, 'Forbidden', 'Not authorized to view these analytics')
        );
      }

      res.json({
        data: formatUrlResource(req.headers.host || '', url),
        included: url.visits.map(visit => ({
          type: 'visits',
          id: visit.id,
          attributes: {
            timestamp: visit.timestamp,
            referrer: visit.referrer,
            country: visit.country,
            deviceType: visit.deviceType,
            browser: visit.browser,
            os: visit.os
          }
        })),
        meta: {
          totalVisits: url.clicks,
          lastVisit: url.visits ? url.visits[url.visits.length - 1].timestamp : 'N/A'
        }
      });

    } catch (error) {
      res.status(500).json(
        formatErrorResponse(500, 'Server Error', 'Failed to fetch analytics')
      );
    }
  }
];

export const getUserUrls = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const urls = await Url.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Url.countDocuments({ user: req.userId });

    res.json(
      formatResponse(
        urls.map(url => formatUrlResource(req.headers.host || '', url)),
        [],
        {
          self: `/api/urls?page=${page}`,
          next: page * limit < total ? `/api/urls?page=${page + 1}` : undefined,
          prev: page > 1 ? `/api/urls?page=${page - 1}` : undefined
        },
        {
          total,
          page,
          pageSize: limit,
          totalPages: Math.ceil(total / limit)
        }
      )
    );

  } catch (error) {
    res.status(500).json(
      formatErrorResponse(500, 'Server Error', 'Failed to fetch URLs')
    );
  }
};

export const deleteUrl = async (req: Request, res: Response) => {
  try {
    const url = await Url.findById(req.params.id);
    
    if (!url) {
      return res.status(404).json(
        formatErrorResponse(404, 'Not Found', 'URL not found')
      );
    }

    if (url.user.toString() !== req.userId) {
      return res.status(403).json(
        formatErrorResponse(403, 'Forbidden', 'Not authorized to delete this URL')
      );
    }

    await Url.deleteOne({ _id: url._id });
    
    // Remove from user's URLs array
    await User.findByIdAndUpdate(req.userId, {
      $pull: { urls: url._id }
    });

    res.status(204).send();

  } catch (error) {
    res.status(500).json(
      formatErrorResponse(500, 'Server Error', 'Failed to delete URL')
    );
  }
};