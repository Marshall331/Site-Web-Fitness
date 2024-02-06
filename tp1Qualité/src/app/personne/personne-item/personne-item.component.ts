import { Component, Input } from '@angular/core';
import { Personne } from '../../model/personne';
@Component({
  selector: 'app-personne-item',
  templateUrl: './personne-item.component.html',
  styleUrls: ['./personne-item.component.css']
})
export class PersonneItemComponent {
  @Input()
  public personne: Personne = new Personne()
  public onChangeId() {
    let newId = 0
    do {
      newId = Math.round(Math.random() * 100)
    } while (newId == this.personne.id)
    console.log(this.personne.id, 'devient', newId)
    this.personne.id = newId
  }
}