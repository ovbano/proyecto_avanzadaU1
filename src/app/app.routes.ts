import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { GameBoardComponent } from './game-board/game-board.component';
import { CreateGameComponent } from './create-game/create-game.component';
import { JoinGameComponent } from './join-game/join-game.component';
import { NgModule } from '@angular/core';
import { WinnersTableComponent } from './winners-table/winners-table.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'create-game', component: CreateGameComponent },
  { path: 'join-game', component: JoinGameComponent },
  { path: 'game-board', component: GameBoardComponent },
  { path: 'record', component: WinnersTableComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
