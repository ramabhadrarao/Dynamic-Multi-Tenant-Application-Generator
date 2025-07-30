import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url, body, query, params } = request;
    const userAgent = request.get('User-Agent') || '';
    const ip = request.ip;
    const userId = request.user?.id || 'anonymous';

    const now = Date.now();
    
    this.logger.log(
      `Incoming Request: ${method} ${url} - User: ${userId} - IP: ${ip} - UserAgent: ${userAgent}`
    );

    if (Object.keys(body || {}).length > 0) {
      // Don't log sensitive data
      const sanitizedBody = { ...body };
      if (sanitizedBody.password) sanitizedBody.password = '[REDACTED]';
      if (sanitizedBody.password_hash) sanitizedBody.password_hash = '[REDACTED]';
      
      this.logger.debug(`Request Body: ${JSON.stringify(sanitizedBody)}`);
    }

    if (Object.keys(query || {}).length > 0) {
      this.logger.debug(`Query Params: ${JSON.stringify(query)}`);
    }

    if (Object.keys(params || {}).length > 0) {
      this.logger.debug(`Route Params: ${JSON.stringify(params)}`);
    }

    return next.handle().pipe(
      tap({
        next: (data) => {
          const responseTime = Date.now() - now;
          this.logger.log(
            `Outgoing Response: ${method} ${url} - Status: ${response.statusCode} - ${responseTime}ms`
          );
          
          if (process.env.NODE_ENV === 'development' && data) {
            this.logger.debug(`Response Data: ${JSON.stringify(data).substring(0, 500)}...`);
          }
        },
        error: (error) => {
          const responseTime = Date.now() - now;
          this.logger.error(
            `Request Error: ${method} ${url} - ${error.message} - ${responseTime}ms`,
            error.stack
          );
        },
      }),
    );
  }
}