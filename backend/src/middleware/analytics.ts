import { NextFunction, Request, Response } from 'express';
import geoip from 'geoip-lite';
import Url from '../models/Url';

export const trackVisit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const url = await Url.findOne({ shortId: req.params.shortId });
  if (!url) return next();

  const visit = {
    timestamp: new Date(),
    referrer: req.get('Referer'),
    country: geoip.lookup(req.ip ?? 0)?.country,
    ip: process.env.NODE_ENV === 'production' ? req.ip : undefined
  };

  await Url.updateOne(
    { _id: url._id },
    { $push: { visits: visit } }
  );

  next();
};