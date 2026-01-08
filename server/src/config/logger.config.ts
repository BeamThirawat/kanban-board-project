import { WinstonModuleOptions, utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import * as path from 'path';

const logsDir = path.join(process.cwd(), 'logs');

// Transport สำหรับ Info logs
const infoRotateTransport = new winston.transports.DailyRotateFile({
    filename: path.join(logsDir, 'info-%DATE%.txt'),
    datePattern: 'DD-MM-YYYY',
    level: 'info',
    maxSize: '20m',
    maxFiles: '14d',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
            return `[${timestamp}] [${level.toUpperCase()}] [${context || 'Application'}] ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
        }),
    ),
});

// Transport สำหรับ Error logs
const errorRotateTransport = new winston.transports.DailyRotateFile({
    filename: path.join(logsDir, 'error-%DATE%.txt'),
    datePattern: 'DD-MM-YYYY',
    level: 'error',
    maxSize: '20m',
    maxFiles: '30d',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message, context, stack, ...meta }) => {
            return `[${timestamp}] [${level.toUpperCase()}] [${context || 'Application'}] ${message} ${stack ? '\n' + stack : ''} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
        }),
    ),
});

// Console transport สำหรับ development
const consoleTransport = new winston.transports.Console({
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.ms(),
        nestWinstonModuleUtilities.format.nestLike('KanbanBoard', {
            colors: true,
            prettyPrint: true,
        }),
    ),
});

export const winstonConfig: WinstonModuleOptions = {
    transports: [
        consoleTransport,
        infoRotateTransport,
        errorRotateTransport,
    ],
};
