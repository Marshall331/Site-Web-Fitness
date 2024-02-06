import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AccueilComponent } from './accueil/accueil.component';
import { MenuComponent } from './menu/menu.component';
import { TacheEditComponent } from './tache/tache-edit/tache-edit.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { RoutineListComponent } from './routine/routine-list/routines-list.component';
import { RoutineItemComponent } from './routine/routine-item/routines-item.component';
import { RoutineDetailComponent } from './routine/routine-detail/routine-detail.component';
import { ExerciceDetailComponent } from './exercice/exercice-detail/exercice-detail.component';
import { ExerciceEditComponent } from './exercice/exercice-edit/exercice-edit.component';
import { ExerciceListComponent } from './exercice/exercice-list/exercice-list.component';
import { ExerciceItemComponent } from './exercice/exercice-item/exercice-item.component';
import { RoutineEditComponent } from './routine/routine-edit/routine-edit.component';

@NgModule({
  declarations: [
    AppComponent,
    RoutineListComponent,
    RoutineItemComponent,
    RoutineDetailComponent,
    RoutineEditComponent,
    ExerciceListComponent,
    ExerciceItemComponent,
    ExerciceDetailComponent,
    ExerciceEditComponent,
    AccueilComponent,
    MenuComponent,
    TacheEditComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    SweetAlert2Module.forRoot({})
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
