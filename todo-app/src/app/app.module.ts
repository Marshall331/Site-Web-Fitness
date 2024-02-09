import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TacheListComponent } from './tache/tache-list/tache-list.component';
import { TacheItemComponent } from './tache/tache-item/tache-item.component';
import { TacheDetailComponent } from './tache/tache-detail/tache-detail.component';
import { AccueilComponent } from './accueil/accueil.component';
import { MenuComponent } from './menu/menu.component';
import { TacheEditComponent } from './tache/tache-edit/tache-edit.component';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    TacheListComponent,
    TacheItemComponent,
    TacheDetailComponent,
    AccueilComponent,
    MenuComponent,
    TacheEditComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
