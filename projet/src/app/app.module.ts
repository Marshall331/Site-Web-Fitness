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
import { RoutineListComponent } from './routines/routines-list/routines-list.component';
import { RoutineItemComponent } from './routines/routines-item/routines-item.component';
import { RoutineDetailComponent } from './routines/routine-detail/routine-detail.component';

@NgModule({
  declarations: [
    AppComponent,
    RoutineListComponent,
    RoutineItemComponent,
    RoutineDetailComponent,
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
