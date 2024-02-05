import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccueilComponent } from './accueil/accueil.component';
import { TacheEditComponent } from './tache/tache-edit/tache-edit.component';
import { RoutineListComponent } from './routine/routine-list/routines-list.component';
import { RoutineDetailComponent } from './routine/routine-detail/routine-detail.component';
import { ExerciceDetailComponent } from './exercice/exercice-detail/exercice-detail.component';
import { ExerciceEditComponent } from './exercice/exercice-edit/exercice-edit.component';
import { ExerciceListComponent } from './exercice/exercice-list/exercice-list.component';


const routes: Routes = [
  { path: 'routine/:id', component: RoutineDetailComponent },
  { path: 'routine/new', component: TacheEditComponent },
  { path: 'routine/edit/:id', component: TacheEditComponent },
  { path: 'routines', component: RoutineListComponent },
  { path: 'exercices/:id', component: ExerciceDetailComponent, },
  { path: 'exercice/new', component: ExerciceEditComponent },
  { path: 'exercice/edit/:id', component: ExerciceEditComponent },
  { path: 'exercices', component: ExerciceListComponent },
  { path: '', component: AccueilComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
