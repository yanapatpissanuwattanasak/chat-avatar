import { Injectable } from '@nestjs/common';
import { PALETTE } from './palette';

export type AvatarType = 'blob' | 'bean' | 'ghost' | 'block' | 'star' | 'cat' | 'bunny' | 'robot' | 'alien';

export interface RoomUser {
  userId: string;
  sessionId: string;
  avatarType: AvatarType;
  color: string;
  x: number;
  y: number;
  name: string | null;
}

const ROOM_CAPACITY = 50;

@Injectable()
export class WorldService {
  private readonly users = new Map<string, RoomUser>();

  isRoomFull(): boolean {
    return this.users.size >= ROOM_CAPACITY;
  }

  add(user: RoomUser): void {
    this.users.set(user.userId, user);
  }

  remove(socketId: string): RoomUser | undefined {
    const user = this.users.get(socketId);
    this.users.delete(socketId);
    return user;
  }

  get(socketId: string): RoomUser | undefined {
    return this.users.get(socketId);
  }

  updatePosition(socketId: string, x: number, y: number): void {
    const user = this.users.get(socketId);
    if (user) {
      user.x = x;
      user.y = y;
    }
  }

  updateName(socketId: string, name: string): void {
    const user = this.users.get(socketId);
    if (user) user.name = name;
  }

  getAll(): RoomUser[] {
    return Array.from(this.users.values());
  }

  count(): number {
    return this.users.size;
  }

  // Returns `preferred` if no collision, otherwise picks another palette color.
  resolveColor(avatarType: AvatarType, preferred: string): string {
    const taken = new Set(
      Array.from(this.users.values())
        .filter((u) => u.avatarType === avatarType)
        .map((u) => u.color),
    );
    if (!taken.has(preferred)) return preferred;

    const available = PALETTE.filter((c) => !taken.has(c));
    if (available.length > 0)
      return available[Math.floor(Math.random() * available.length)];

    return preferred; // all colors taken — allow the duplicate
  }
}
