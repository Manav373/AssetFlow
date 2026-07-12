/**
 * @module Gateway
 * @description NestJS module wiring for the Socket.IO real-time notification gateway.
 *              Exports NotificationGateway so other services can inject it to push events.
 * @authors Developer 2
 * @status Completed
 * @collaboration Imported by AppModule. Other services (AllocationsService etc.) can inject
 *                NotificationGateway to call sendNotificationToUser() after workflow updates.
 */

import { Module } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';

@Module({
  providers: [NotificationGateway],
  exports: [NotificationGateway],
})
export class GatewayModule {}
