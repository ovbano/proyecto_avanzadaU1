import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SocketService } from '../socket.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-waiting-room',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './waiting-room.component.html',
  styleUrl: './waiting-room.component.css'
})
export class WaitingRoomComponent {
  @Input() gameCode: string = '';
  @Input() players: string[] = [];
  @Input() gameReady: boolean = false;
  @Output() gameStarted = new EventEmitter<void>();

  constructor(private socketService: SocketService, private router: Router) {
    this.socketService.on('gameReady', (data: any) => {
      this.gameReady = true;
    });

    this.socketService.on('gameStarted', (data: any) => {
      console.log('Evento recibido:', data.message); // Debug
      this.router.navigate(['/game-board']); // Redirigir al tablero de puntos
    });
  }

  // Método para iniciar la partida
  startGame() {
    if (this.gameCode) {
      this.socketService.emit('startGame', this.gameCode);
    }
  }

}
