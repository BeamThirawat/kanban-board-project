import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  uptimeFormatted: string;
  version: string;
  environment: string;
  checks: {
    database: {
      status: 'up' | 'down';
      responseTime?: number;
      error?: string;
    };
    memory: {
      status: 'ok' | 'warning' | 'critical';
      heapUsed: string;
      heapTotal: string;
      rss: string;
      usagePercent: number;
    };
    system: {
      platform: string;
      nodeVersion: string;
      pid: number;
    };
  };
}

@Injectable()
export class AppService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) { }

  async getHealthStatus(): Promise<HealthCheckResult> {
    const startTime = Date.now();

    // Check database connection
    const databaseCheck = await this.checkDatabase();

    // Check memory usage
    const memoryCheck = this.checkMemory();

    // Determine overall status
    let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';

    if (databaseCheck.status === 'down') {
      overallStatus = 'unhealthy';
    } else if (memoryCheck.status === 'critical') {
      overallStatus = 'unhealthy';
    } else if (memoryCheck.status === 'warning') {
      overallStatus = 'degraded';
    }

    // Format uptime
    const uptime = process.uptime();
    const uptimeFormatted = this.formatUptime(uptime);

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: uptime,
      uptimeFormatted: uptimeFormatted,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks: {
        database: databaseCheck,
        memory: memoryCheck,
        system: {
          platform: process.platform,
          nodeVersion: process.version,
          pid: process.pid,
        },
      },
    };
  }

  private async checkDatabase(): Promise<{
    status: 'up' | 'down';
    responseTime?: number;
    error?: string;
  }> {
    const startTime = Date.now();

    try {
      // Try to execute a simple query
      await this.dataSource.query('SELECT 1');
      const responseTime = Date.now() - startTime;

      return {
        status: 'up',
        responseTime: responseTime,
      };
    } catch (error) {
      return {
        status: 'down',
        error: error instanceof Error ? error.message : 'Unknown database error',
      };
    }
  }

  private checkMemory(): {
    status: 'ok' | 'warning' | 'critical';
    heapUsed: string;
    heapTotal: string;
    rss: string;
    usagePercent: number;
  } {
    const memoryUsage = process.memoryUsage();
    const heapUsedMB = memoryUsage.heapUsed / 1024 / 1024;
    const heapTotalMB = memoryUsage.heapTotal / 1024 / 1024;
    const rssMB = memoryUsage.rss / 1024 / 1024;
    const usagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;

    let status: 'ok' | 'warning' | 'critical' = 'ok';

    if (usagePercent > 90) {
      status = 'critical';
    } else if (usagePercent > 70) {
      status = 'warning';
    }

    return {
      status: status,
      heapUsed: `${heapUsedMB.toFixed(2)} MB`,
      heapTotal: `${heapTotalMB.toFixed(2)} MB`,
      rss: `${rssMB.toFixed(2)} MB`,
      usagePercent: Math.round(usagePercent),
    };
  }

  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    parts.push(`${secs}s`);

    return parts.join(' ');
  }
}
