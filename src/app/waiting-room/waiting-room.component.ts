import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { SocketService } from '../socket.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Jugador {
  nombre: string;
  avatar: string;
}

interface MensajeChat {
  nombre: string;
  texto: string;
}

@Component({
  selector: 'app-waiting-room',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './waiting-room.component.html',
  styleUrl: './waiting-room.component.css'
})
export class WaitingRoomComponent {
  @Input() gameCode: string = '';
  @Input() players: string[] = [];
  @Input() gameReady: boolean = false;
  @Output() gameStarted = new EventEmitter<void>();

  jugadores: Jugador[] = [];
  mensajesChat: MensajeChat[] = [];
  mensajeActual: string = '';
  tiempoRestante: string = '03:25';
  showModal = false;

  constructor(private socketService: SocketService, private router: Router) {}

  ngOnInit(): void {
    this.jugadores = [
      { nombre: 'Jugador 1', avatar: 'https://img.lovepik.com/free-png/20211216/lovepik-boy-avatar-png-image_401704859_wh1200.png' },
      { nombre: 'Jugador 2', avatar: 'https://w7.pngwing.com/pngs/905/625/png-transparent-computer-icons-user-profile-women-avatar-child-face-head-thumbnail.png' },
      { nombre: 'Jugador 3', avatar: 'https://png.pngtree.com/png-clipart/20230817/original/pngtree-round-kid-avatar-boy-face-picture-image_8005285.png' },
      { nombre: 'Jugador 4', avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRw_hbDv8wCg9B3WF4CxBKShSiSgJbDUHmE3KdwpWDdIv9XyZaWufbQ1V-OzgNWaJ4ABuk&usqp=CAU' }
    ];

    this.mensajesChat = [
      { nombre: 'Jugador 1', texto: '¡Hola a todos!' },
      { nombre: 'Jugador 2', texto: '¿Listos para jugar?' }
    ];

    this.iniciarTemporizador();

    this.socketService.on('gameReady', (data: any) => {
      this.gameReady = true;
    });

    this.socketService.on('gameStarted', (data: any) => {
      console.log('Evento recibido:', data.message);
      this.router.navigate(['/game-board']);
    });
  }

  @HostListener('document:keydown.escape', ['$event'])
  handleEscapeKey(event: KeyboardEvent) {
    if (this.showModal) {
      this.closeModal();
    }
  }

  iniciarTemporizador(): void {
    let minutos = 3;
    let segundos = 25;

    const intervalo = setInterval(() => {
      segundos--;

      if (segundos < 0) {
        minutos--;
        segundos = 59;
      }

      if (minutos < 0) {
        clearInterval(intervalo);
        this.tiempoRestante = '00:00';
      } else {
        this.tiempoRestante = `${this.formatearTiempo(minutos)}:${this.formatearTiempo(segundos)}`;
      }
    }, 1000);
  }

  formatearTiempo(valor: number): string {
    return valor < 10 ? `0${valor}` : valor.toString();
  }

  enviarMensaje(): void {
    if (this.mensajeActual.trim() !== '') {
      this.mensajesChat.push({ nombre: 'Tú', texto: this.mensajeActual });
      this.mensajeActual = '';
    }
  }

  startGame(): void {
    if (this.gameCode) {
      this.socketService.emit('startGame', this.gameCode);
    }
  }

  salirSala(): void {
    alert('Has salido de la sala');
  }

  openModal(): void {
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

}
