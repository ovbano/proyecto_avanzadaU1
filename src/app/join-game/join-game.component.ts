import { Component } from '@angular/core';
import { SocketService } from '../socket.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WaitingRoomComponent } from '../waiting-room/waiting-room.component';

@Component({
  selector: 'app-join-game',
  standalone: true,
  imports: [ CommonModule, FormsModule, WaitingRoomComponent],
  templateUrl: './join-game.component.html',
  styleUrl: './join-game.component.css'
})
export class JoinGameComponent {
  gameCode: string = '';
  players: string[] = [];  // Definir la propiedad 'players'
  waiting: boolean = false;

  constructor(private socketService: SocketService, private router: Router) {
    // Escuchar los jugadores que se unen a la partida
    this.socketService.on('playerJoined', (data: any) => {
      this.players = data.players;
    });
  }

  joinGame() {
    if (this.gameCode) {
      this.socketService.emit(
        'joinGame',
        { gameCode: this.gameCode },
        (response: any) => {
          if (response.success) {
            console.log('Unido a la partida:', this.gameCode);
            this.waiting = true; // Cambiar a sala de espera
          } else {
            console.error('Error al unirse:', response.message);
          }
        }
      );
    }
  }
}
