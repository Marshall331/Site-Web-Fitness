import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { PersonneItemComponent } from './personne/personne-item/personne-item.component';

@NgModule({
    declarations: [
        AppComponent,
        PersonneItemComponent
    ],
    imports: [
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
