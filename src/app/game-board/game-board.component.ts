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
  tokens: number[] = Array(12).fill(0); // 12 fichas inicialmente


  constructor(private socketService: SocketService) {}

  ngOnInit() {
    this.listenToGameUpdates();
    this.listenToScoreUpdates();
    console.log('Jugadores al iniciar:', this.players);  // Verifica los jugadores al cargar el componente
  }

  // Lógica para usar una ficha
  useToken() {
    if (this.tokens.length > 0) {
      this.tokens.pop(); // Elimina la última ficha
      console.log(`Fichas restantes: ${this.tokens.length}`);
    } else {
      alert('No quedan fichas disponibles.');
    }
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
    const parsedScore = parseInt(score, 10) || 0;
    if (this.scores[player] && this.scores[player][round] !== undefined) {
      this.scores[player][round] = parsedScore;
      console.log(`Puntaje actualizado para ${player} en la ronda ${round}: ${parsedScore}`);
      // Emitir cambios al servidor
      this.socketService.emit('updateScore', { gameCode, player, round, score: parsedScore });
    } else {
      console.error('Jugador o ronda inválidos para actualizar el puntaje.');
    }
  }

  chips: number = 12;

  decreaseChips(): void {
    if (this.chips > 0) {
      this.chips--;
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
