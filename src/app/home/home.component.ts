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
  constructor(private router: Router) {}

  // Redirigir al componente de crear partida
  goToCreateGame() {
    this.router.navigate(['/create-game']);
  }

  // Redirigir al componente de unirse a partida
  goToJoinGame() {
    this.router.navigate(['/join-game']);
  }

  // Redirigir al componente de unirse a partida
  goToRecords() {
    this.router.navigate(['/record']);
  }

}
