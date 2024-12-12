import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SocketService } from '../socket.service';

@Component({
  selector: 'app-game-board',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-board.component.html',
  styleUrl: './game-board.component.css'
})
export class GameBoardComponent {
  players: string[] = []; // Lista de jugadores
  rounds: string[] = ['1/3', '2/3', '1/4', '2/4', '1/5', '2/5', 'ESCALERA']; // Columnas de rondas
  scores: { [player: string]: { [round: string]: number } } = {}; // Puntajes
  gameCode: string = ''; // Código de la partida (puedes obtenerlo según tu lógica)

  constructor(private socketService: SocketService) {}

  ngOnInit() {
    this.listenToGameUpdates();
  }

  // Escuchar actualizaciones de la partida
  listenToGameUpdates() {
    this.socketService.on('playerJoined', (data: { players: string[] }) => {
      this.players = data.players;

      // Inicializar puntajes para nuevos jugadores
      this.players.forEach((player) => {
        if (!this.scores[player]) {
          this.scores[player] = {};
          this.rounds.forEach((round) => (this.scores[player][round] = 0));
        }
      });
    });
  }

  // Obtener puntaje actual
  getScore(player: string, round: string): number {
    return this.scores[player]?.[round] || 0;
  }

  // Actualizar puntaje manualmente
  updateScore(gameCode: string, player: string, round: string, score: string) {
    const parsedScore = parseInt(score, 10) || 0;
    this.scores[player][round] = parsedScore;

    // Emitir cambios al servidor
    this.socketService.emit('updateScore', {
      gameCode,
      player,
      round,
      score: parsedScore,
    });
  }

  handleInputChange(event: Event): string {
    const target = event.target as HTMLInputElement;
    return target?.value || '0';
  }

}
