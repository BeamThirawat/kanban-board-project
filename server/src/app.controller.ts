import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get('health')
  @ApiOperation({
    summary: 'Health check',
    description: 'Check the health status of the API including database connection, memory usage, and system information'
  })
  @ApiResponse({
    status: 200,
    description: 'Returns detailed health status of the API',
    schema: {
      example: {
        status: 'healthy',
        timestamp: '2026-01-06T09:30:00.000Z',
        uptime: 3600,
        uptimeFormatted: '1h 0m 0s',
        version: '1.0.0',
        environment: 'development',
        checks: {
          database: { status: 'up', responseTime: 5 },
          memory: { status: 'ok', heapUsed: '50.00 MB', heapTotal: '100.00 MB', rss: '120.00 MB', usagePercent: 50 },
          system: { platform: 'win32', nodeVersion: 'v20.0.0', pid: 12345 }
        }
      }
    }
  })
  async healthCheck() {
    return this.appService.getHealthStatus();
  }
}
