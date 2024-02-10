import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoutineListComponent } from './routine/routine-list/routines-list.component';
import { RoutineDetailComponent } from './routine/routine-detail/routine-detail.component';
import { ExerciceDetailComponent } from './exercice/exercice-detail/exercice-detail.component';
import { ExerciceListComponent } from './exercice/exercice-list/exercice-list.component';
import { RoutineEditComponent } from './routine/routine-edit/routine-edit.component';
import { ExerciceEditComponent } from './exercice/exercice-edit/exercice-edit.component';
import { ExerciceTypeEditComponent } from './exerciceType/exercice-type-edit/exercice-type-edit.component';
import { ExerciceTypeDetailComponent } from './exerciceType/exercice-type-detail/exercice-type-detail.component';
import { ExerciceTypeListComponent } from './exerciceType/exercice-type-list/exercice-type-list.component';

const routes: Routes = [
  { path: 'routine/new', component: RoutineEditComponent },
  { path: 'routine/edit/:id', component: RoutineEditComponent },
  { path: 'routine/:id', component: RoutineDetailComponent },
  { path: 'routines', component: RoutineListComponent },
  { path: 'routine/:routineId/exercice/edit/:idExo', component: ExerciceEditComponent },
  { path: 'routine/:routineId/exercice/:idExo', component: ExerciceDetailComponent, },
  { path: 'exercice/new', component: ExerciceEditComponent },
  { path: 'exercice/edit/:idExo', component: ExerciceEditComponent },
  { path: 'exercice/:idExo', component: ExerciceDetailComponent, },
  { path: 'exercices', component: ExerciceListComponent },
  { path: 'exercicetype/new', component: ExerciceTypeEditComponent },
  { path: 'exercicetype/edit/:id', component: ExerciceTypeEditComponent },
  { path: 'exercicetype/:id', component: ExerciceTypeDetailComponent, },
  { path: 'exercicestypes', component: ExerciceTypeListComponent },
  { path: '', component: RoutineListComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
