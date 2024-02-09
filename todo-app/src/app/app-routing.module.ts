import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccueilComponent } from './accueil/accueil.component';
import { TacheDetailComponent } from './tache/tache-detail/tache-detail.component';
import { TacheEditComponent } from './tache/tache-edit/tache-edit.component';
import { TacheListComponent } from './tache/tache-list/tache-list.component';

const routes: Routes = [
  { path: 'taches',         component:TacheListComponent },
  { path: 'tache/new',      component:TacheEditComponent },
  { path: 'tache/edit/:id', component:TacheEditComponent},
  { path: 'tache/:id',      component:TacheDetailComponent },
  { path: '',               component:AccueilComponent   }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
