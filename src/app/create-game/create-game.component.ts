import { Component } from '@angular/core';
import { SocketService } from '../socket.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { WaitingRoomComponent } from '../waiting-room/waiting-room.component';

@Component({
  selector: 'app-create-game',
  standalone: true,
  imports: [CommonModule, WaitingRoomComponent],
  templateUrl: './create-game.component.html',
  styleUrl: './create-game.component.css'
})
export class CreateGameComponent {
  gameCode: string = '';
  players: string[] = [];  // Definir la propiedad 'players'
  waiting: boolean = false;

  constructor(private socketService: SocketService, private router: Router) {
    // Escuchar los jugadores que se unen a la partida
    this.socketService.on('playerJoined', (data: any) => {
      this.players = data.players;
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

}
