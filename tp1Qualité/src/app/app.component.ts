import { Component } from '@angular/core';
import { Personne } from './model/personne';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  public title = 'angular-tests'
  public iut = 'blagnac'
  public personnes: Personne[] = [
    new Personne(),
    new Personne('Robert'),
    new Personne('Jean-Pierre', 31, "jp-31@mail.fr"),
    new Personne('Lou', 10, "lou@mail.fr")
  ]
  static personne: any;
}

