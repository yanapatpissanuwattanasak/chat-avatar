import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { FilterService } from '../moderation/filter.service';
import { AvatarType, WorldService } from './world.service';

interface JoinPayload {
  sessionId: string;
  avatarType: AvatarType;
  color: string;
  x: number;
  y: number;
  name?: string | null;
}

interface MovePayload {
  x: number;
  y: number;
}

interface MessagePayload {
  text: string;
}

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? 'http://localhost:3001';

@WebSocketGateway({ cors: { origin: CLIENT_ORIGIN, credentials: true } })
export class WorldGateway implements OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(WorldGateway.name);

  constructor(
    private readonly worldService: WorldService,
    private readonly filterService: FilterService,
  ) {}

  @SubscribeMessage('join')
  handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinPayload,
  ) {
    if (this.worldService.isRoomFull()) {
      client.emit('room_full', { message: 'This space is full — check back soon.' });
      return;
    }

    const color = this.worldService.resolveColor(payload.avatarType, payload.color);

    const rawName = typeof payload.name === 'string' ? payload.name.trim().slice(0, 16) : null;
    const user = {
      userId: client.id,
      sessionId: payload.sessionId ?? '',
      avatarType: payload.avatarType,
      color,
      x: Math.max(0, payload.x ?? 0),
      y: Math.max(0, payload.y ?? 0),
      name: rawName || null,
    };

    this.worldService.add(user);
    this.logger.log(`JOIN  id=${client.id} type=${user.avatarType} color=${user.color}`);

    client.emit('room_state', {
      users: this.worldService.getAll().filter((u) => u.userId !== client.id),
      you: { color: user.color, avatarType: user.avatarType },
    });

    client.broadcast.emit('spawn', {
      userId: client.id,
      avatarType: user.avatarType,
      color: user.color,
      x: user.x,
      y: user.y,
      name: user.name,
    });

    this.server.emit('count', { count: this.worldService.count() });
  }

  @SubscribeMessage('move')
  handleMove(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: MovePayload,
  ) {
    if (!this.worldService.get(client.id)) return;

    const x = Math.max(0, Math.min(5000, payload.x ?? 0));
    const y = Math.max(0, Math.min(5000, payload.y ?? 0));

    this.worldService.updatePosition(client.id, x, y);
    client.broadcast.emit('move', { userId: client.id, x, y });
  }

  @SubscribeMessage('message')
  handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: MessagePayload,
  ) {
    const user = this.worldService.get(client.id);
    if (!user) return;

    const result = this.filterService.validate(client.id, payload.text);
    if (!result.ok) return;

    // Persist log entry for abuse review
    this.logger.log(
      `MSG   id=${client.id} sid=${user.sessionId} text="${result.text}"`,
    );

    this.server.emit('message', { userId: client.id, text: result.text });
  }

  @SubscribeMessage('set_name')
  handleSetName(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { name: string },
  ) {
    const user = this.worldService.get(client.id);
    if (!user) return;
    const name = typeof payload.name === 'string' ? payload.name.trim().slice(0, 16) : '';
    if (!name) return;
    this.worldService.updateName(client.id, name);
    client.broadcast.emit('name_update', { userId: client.id, name });
  }

  handleDisconnect(client: Socket) {
    this.filterService.cleanup(client.id);
    const user = this.worldService.remove(client.id);
    if (!user) return;

    this.logger.log(`LEAVE id=${client.id}`);
    this.server.emit('despawn', { userId: client.id });
    this.server.emit('count', { count: this.worldService.count() });
  }
}
