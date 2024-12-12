import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: Socket;

  constructor() {
    this.socket = io('http://localhost:3000'); // URL del servidor
  }

  emit(event: string, data: any, callback?: (response: any) => void) {
    if (callback) {
      this.socket.emit(event, data, callback); // Proporciona el callback correctamente
    } else {
      this.socket.emit(event, data);
    }
  }

  on(event: string, callback: (data: any) => void) {
    this.socket.on(event, callback);
  }
}
