import { Component } from '@angular/core';
import { SocketService } from '../socket.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  gameCode: string = '';
  players: string[] = [];
  waiting: boolean = false; // Estado de espera
  gameReady: boolean = false; // Estado de la partida lista

  constructor(private socketService: SocketService, private router: Router) {
    // Escuchar eventos del servidor
    this.socketService.on('playerJoined', (data: any) => {
      this.players = data.players;
    });

    this.socketService.on('gameReady', (data: any) => {
      this.gameReady = true;
    });

    this.socketService.on('gameStarted', (data: any) => {
      console.log('Evento recibido:', data.message); // Debug
      this.router.navigate(['/game-board']); // Redirigir al tablero de puntos
    });
  }

  createGame() {
    this.gameCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    this.socketService.emit(
      'createGame',
      { gameCode: this.gameCode },
      (response: any) => {
        if (response.success) {
          console.log('Partida creada:', response.gameCode);
          this.waiting = true; // Cambiar a sala de espera
        } else {
          console.error('Error al crear la partida:', response.message);
        }
      }
    );
  }

  joinGame() {
    const code = prompt('Ingresa el código de la partida:');
    if (code) {
      this.socketService.emit(
        'joinGame',
        { gameCode: code },
        (response: any) => {
          if (response.success) {
            console.log('Unido a la partida:', code);
            this.waiting = true; // Cambiar a sala de espera
          } else {
            console.error('Error al unirse:', response.message);
          }
        }
      );
    }
  }

  startGame() {
    if (this.gameCode) {
      this.socketService.emit('startGame', this.gameCode);
    }
  }

}
