import { Component } from '@angular/core';
import { SocketService } from '../socket.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WaitingRoomComponent } from '../waiting-room/waiting-room.component';

@Component({
  selector: 'app-create-game',
  standalone: true,
  imports: [CommonModule, FormsModule, WaitingRoomComponent],
  templateUrl: './create-game.component.html',
  styleUrls: ['./create-game.component.css']
})
export class CreateGameComponent {
  gameCode: string = '';
  players: string[] = [];
  waiting: boolean = false;
  playerName: string = '';
  playerCount: number = 2;

  constructor(private socketService: SocketService, private router: Router) {
    this.socketService.on('playerJoined', (data: any) => {
      this.players = data.players;
    });
  }

  onSubmit() {
    if (this.playerName && this.playerCount) {
      this.createGame();
    } else {
      alert('Por favor, complete todos los campos.');
    }
  }

  createGame() {
    this.gameCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.players = [this.playerName];
    this.socketService.emit(
      'createGame',
      { gameCode: this.gameCode, playerCount: this.playerCount },
      (response: any) => {
        if (response.success) {
          console.log('Partida creada:', response.gameCode);
          this.waiting = true;
        } else {
          console.error('Error al crear la partida:', response.message);
        }
      }
    );
  }
}
