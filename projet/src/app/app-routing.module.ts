import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccueilComponent } from './accueil/accueil.component';
import { TacheEditComponent } from './tache/tache-edit/tache-edit.component';
import { RoutineListComponent } from './routines/routines-list/routines-list.component';
import { RoutineDetailComponent } from './routines/routine-detail/routine-detail.component';


const routes: Routes = [
  { path: 'routine/new', component: TacheEditComponent },
  { path: 'routine/edit/:id', component: TacheEditComponent },
  { path: 'routines', component: RoutineListComponent },
  { path: 'routine/:id', component: RoutineDetailComponent },
  { path: '', component: AccueilComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
