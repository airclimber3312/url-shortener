# URL Shortener

A full-stack URL shortening service built with React, Node.js, TypeScript, and Docker.

![Screenshot](./screenshot.png)

## ✨ Features

- **URL Shortening**: Convert long URLs into short, memorable links
- **Custom Slugs**: Choose your own URL endings (e.g: `/your-brand`)
- **User Authentication**: Secure signup/login with JWT
- **Dashboard**: Manage all your shortened URLs
- **Analytics**: Track click counts and visit details
- **Editable Links**: Modify existing short URLs
- **Docker Support**: Easy containerized deployment

## 🛠 Tech Stack

**Frontend**:
- React 18
- TypeScript
- Axios
- React Router
- CSS Modules

**Backend**:
- Node.js 18
- Express
- MongoDB
- Mongoose
- JSON:API
- JWT Authentication

**DevOps**:
- Docker
- Docker Compose
- Nginx (Production build)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Docker 20+
- MongoDB (or Docker to run MongoDB)

### Development Setup

1. Clone the repository:
```bash
git clone https://github.com/airclimber3312/url-shortener.git
cd url-shortener
```

2. Start services using Docker:

```bash
docker-compose up --build
```

## Access the application:
```
 - Frontend: http://localhost:80
 - Backend API: http://localhost:3000
```
