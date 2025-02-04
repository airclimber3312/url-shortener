import { Schema, model, Document, Types } from 'mongoose';
import { Visit } from '../types/url';

export interface IUrl extends Document {
  originalUrl: string;
  shortId: string;
  user: Types.ObjectId;
  visits: Visit[];
  clicks: number;
  meta?: {
    title?: string;
    description?: string;
    favicon?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const VisitSchema = new Schema<Visit>({
  timestamp: { type: Date, default: Date.now },
  referrer: String,
  country: String,
  deviceType: String,
  browser: String,
  os: String
}, { _id: false });

const UrlSchema = new Schema<IUrl>({
  originalUrl: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v: string) {
        try {
          new URL(v);
          return true;
        } catch {
          return false;
        }
      },
      message: 'Invalid URL format'
    }
  },
  shortId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    validate: {
      validator: function(v: string) {
        return /^[a-zA-Z0-9_-]{3,20}$/.test(v);
      },
      message: 'Slug must be 3-20 alphanumeric characters'
    }
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  visits: [VisitSchema],
  clicks: {
    type: Number,
    default: 0
  },
  meta: {
    title: String,
    description: String,
    favicon: String
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      delete ret._id;
      delete ret.__v;
      delete ret.user;
      return ret;
    }
  }
});

// Indexes
UrlSchema.index({ createdAt: 1 });
UrlSchema.index({ updatedAt: 1 });
UrlSchema.index({ 'meta.title': 'text', 'meta.description': 'text' });

// Static methods
UrlSchema.statics.findExisting = async function(originalUrl: string, userId: string) {
  return this.findOne({ originalUrl, user: userId });
};

// Virtuals
UrlSchema.virtual('shortUrl').get(function() {
  return `${process.env.BASE_URL}/${this.shortId}`;
});

const Url = model<IUrl>('Url', UrlSchema);

export default Url;