/**
 * @module Gateway
 * @description Socket.IO WebSocket gateway for real-time push notifications.
 *              Authenticates connections via JWT bearer token in handshake headers.
 *              Rejects connections with invalid/missing JWT signatures.
 *              Provides sendNotificationToUser() to emit to a specific user's room.
 * @authors Developer 2
 * @status Completed
 * @collaboration Frontend Developer D — agree on Socket.IO event namespaces:
 *                  - 'notification:new'   → per-user alert events
 *                  - 'dashboard:refresh'  → broadcast to refresh dashboard widgets
 *                Coordinate with Developer A (Auth) on shared JWT_SECRET env variable.
 */

import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

// --- START: Collaborative edit by Developer 2 & Developer A ---
const JWT_SECRET = process.env.JWT_ACCESS_SECRET || 'SuperSecretAccessSecret123!';
// --- END: Collaborative edit ---

@Injectable()
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/',
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationGateway.name);

  /**
   * Authenticate socket on connection handshake.
   * Reads Authorization: Bearer <token> from handshake headers or auth object.
   * Rejects with disconnect if JWT signature is invalid.
   */
  async handleConnection(client: Socket) {
    try {
      const token =
        this.extractToken(client.handshake?.auth?.token) ||
        this.extractToken(client.handshake?.headers?.authorization);

      if (!token) {
        this.logger.warn(`Connection rejected — no token provided [${client.id}]`);
        client.disconnect(true);
        return;
      }

      const payload = jwt.verify(token, JWT_SECRET) as { sub: string; role: string };

      // Join user to their own room for targeted notifications
      await client.join(`user:${payload.sub}`);
      client.data.userId = payload.sub;
      client.data.role = payload.role;

      this.logger.log(`Client connected: ${client.id} | user: ${payload.sub}`);
    } catch (err) {
      this.logger.warn(`Connection rejected — invalid JWT [${client.id}]: ${err.message}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id} | user: ${client.data?.userId ?? 'unknown'}`);
  }

  /**
   * Emit a notification event to a specific user's socket room.
   * Call this from any service after a workflow state change.
   *
   * @param userId  — Target user's database ID
   * @param payload — Notification payload (message, type, resourceId, etc.)
   *
   * @example
   *   this.gateway.sendNotificationToUser(userId, {
   *     type: 'ALLOCATION',
   *     message: 'Asset AF-0042 has been allocated to you.',
   *     assetId: 'clfx...',
   *   });
   */
  sendNotificationToUser(userId: string, payload: Record<string, any>) {
    this.server.to(`user:${userId}`).emit('notification:new', {
      ...payload,
      timestamp: new Date().toISOString(),
    });
    this.logger.log(`notification:new → user:${userId}`);
  }

  /**
   * Broadcast a dashboard refresh event to all connected clients.
   * Triggers frontend widgets to re-fetch data.
   * Coordinate event name with Developer D (Frontend).
   */
  broadcastDashboardRefresh(payload?: Record<string, any>) {
    this.server.emit('dashboard:refresh', {
      ...payload,
      timestamp: new Date().toISOString(),
    });
    this.logger.log(`dashboard:refresh broadcast sent`);
  }

  // ────────────────────────────────────────────────────────
  // Private helpers
  // ────────────────────────────────────────────────────────

  private extractToken(header?: string): string | null {
    if (!header) return null;
    if (header.startsWith('Bearer ')) return header.slice(7);
    return header; // raw token passed via auth object
  }
}
