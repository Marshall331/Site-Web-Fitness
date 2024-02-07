import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Exercice } from 'src/app/models/exercice';
import { ExerciceService } from 'src/app/services/exercice.service';

@Component({
  selector: 'app-exercice-item',
  templateUrl: './exercice-item.component.html',
  styleUrls: ['./exercice-item.component.css']
})
export class ExerciceItemComponent {
  @Input()
  public exercice: Exercice = new Exercice();
  @Input()
  isSelected: boolean = false;
  @Output()
  checkboxChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input()
  public routineId: number | undefined;

  constructor(
    private exerciceService: ExerciceService,
    private router: Router,
  ) {
  }

  onCheckboxChange(event: any): void {
    this.checkboxChange.emit(event.target.checked);
  }

  onSupprime(): void {
    Swal.fire({
      title: "Voulez vous réellement supprimer cette exercice ?",
      showDenyButton: true,
      confirmButtonText: "Supprimer",
      denyButtonText: `Annuler`
    }).then((result) => {
      if (result.isConfirmed) {
        let Observable = this.exerciceService.deleteExercice(this.exercice.id);
        Observable.subscribe({
          next: routine => {
            Swal.fire("Exercice supprimé !", "", "success");
            this.navigateBack();
          },
          error: err => {
            window.alert("Erreur lors de la suppression de l'exercice.\nCode d'erreur : " + err)
            this.navigateBack();
          }
        })
      } else if (result.isDenied) {
        Swal.fire('Suppression annulée.', '', 'info');
      }
    });
  }

  private navigateBack(): void {
    if (this.routineId) {
      this.router.navigateByUrl('/').then(() => this.router.navigateByUrl('/routine/' + this.routineId));
    } else {
      this.router.navigateByUrl('/').then(() => this.router.navigateByUrl('/exercices'))
    }
  }
}