import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealthStatus() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  getApiInfo() {
    return {
      name: 'Kanban Board API',
      version: '1.0.0',
      description: 'RESTful API for Kanban Board Application',
      documentation: '/api/v1/docs',
      endpoints: {
        health: 'GET /api/v1/health',
        users: {
          list: 'GET /api/v1/users',
          create: 'POST /api/v1/users',
          get: 'GET /api/v1/users/:id',
          update: 'PATCH /api/v1/users/:id',
          delete: 'DELETE /api/v1/users/:id',
        },
      },
    };
  }
}
