import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'mini-e2e';
  points = 1;

  onPlus() {
    this.points++
    }
    onReset() {
    this.points = 0
    }
   
}
