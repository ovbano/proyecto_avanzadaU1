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
    this.listenToScoreUpdates();
    console.log('Jugadores al iniciar:', this.players);  // Verifica los jugadores al cargar el componente
  }

  // Escuchar las actualizaciones de los puntajes en tiempo real
  listenToScoreUpdates() {
    this.socketService.on('scoreUpdated', (data: { [player: string]: { [round: string]: number } }) => {
      console.log('Puntajes actualizados:', data);
      this.scores = { ...this.scores, ...data }; // Actualizar los puntajes de manera segura
    });
  }

  // Escuchar actualizaciones de la partida
  listenToGameUpdates() {
    this.socketService.on('gameUpdated', (data: { players: string[], scores: { [player: string]: { [round: string]: number } }, started: boolean }) => {
      console.log('Jugadores recibidos:', data.players);  // Verificar los jugadores
      this.players = [...data.players];

      // Inicializar puntajes para nuevos jugadores
      this.players.forEach((player) => {
        if (!this.scores[player]) {
          this.scores[player] = {};
          this.rounds.forEach((round) => (this.scores[player][round] = 0));
        }
      });

      // Actualizar puntajes si se recibe un objeto de puntajes
      if (data.scores) {
        this.scores = { ...this.scores, ...data.scores };
      }

    });
  }


  // Obtener puntaje actual
  getScore(player: string, round: string): number {
    return this.scores[player]?.[round] || 0;
  }

  // Actualizar puntaje manualmente
  updateScore(gameCode: string, player: string, round: string, score: string) {
    if (!gameCode) {
      console.error('El código de la partida no está definido');
      return;
    }

    const parsedScore = parseInt(score, 10) || 0;
    if (this.scores[player] && this.scores[player][round] !== undefined) {
      this.scores[player][round] = parsedScore;

      // Emitir cambios al servidor
      this.socketService.emit('updateScore', {
        gameCode,
        player,
        round,
        score: parsedScore,
      });
    } else {
      console.error('Jugador o ronda inválidos para actualizar el puntaje.');
    }
  }


  // Calcular el total de los puntajes de un jugador
  getTotalScore(player: string): number {
    return this.rounds.reduce(
      (total, round) => total + (this.scores[player]?.[round] || 0),
      0
    );
  }

  handleInputChange(event: Event): string {
    const target = event.target as HTMLInputElement;
    return target ? target.value : '0'; // Asegura que target sea un input válido
  }

}
