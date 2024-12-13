import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  public socket: Socket;

  constructor() {
    this.socket = io('http://localhost:3000'); // URL del servidor Socket.IO
  }

  /**
   * Emitir un evento al servidor.
   * @param event Nombre del evento.
   * @param data Datos que se enviarán al servidor.
   * @param callback Función opcional que recibe la respuesta del servidor.
   */
  emit(event: string, data: any, callback?: (response: any) => void): void {
    if (callback) {
      this.socket.emit(event, data, callback);
    } else {
      this.socket.emit(event, data);
    }
  }

  /**
   * Escuchar un evento desde el servidor.
   * @param event Nombre del evento.
   * @param callback Función que se ejecutará al recibir los datos del evento.
   */
  on(event: string, callback: (data: any) => void): void {
    this.socket.on(event, callback);
  }

  /**
   * Detener la escucha de un evento específico.
   * @param event Nombre del evento.
   */
  off(event: string): void {
    this.socket.off(event);
  }

  /**
   * Desconectar el cliente del servidor.
   */
  disconnect(): void {
    this.socket.disconnect();
  }

  /**
   * Reconectar manualmente al servidor.
   */
  connect(): void {
    if (!this.socket.connected) {
      this.socket.connect();
    }
  }
}
