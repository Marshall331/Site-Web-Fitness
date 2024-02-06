import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ExerciceTypes } from 'src/app/models/exercice-types';
import { ExerciceTypesService } from 'src/app/services/exercice-types.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-exercice-type-item',
  templateUrl: './exercice-type-item.component.html',
  styleUrl: './exercice-type-item.component.css'
})
export class ExerciceTypeItemComponent {
  @Input()
  public exerciceType: ExerciceTypes = new ExerciceTypes();
  @Input()
  isSelected: boolean = false;
  @Output()
  checkboxChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input()
  public routineId: number | undefined;

  constructor(
    private exerciceTypeService: ExerciceTypesService,
    private router: Router,
  ) { }

  onCheckboxChange(event: any): void {
    this.checkboxChange.emit(event.target.checked);
  }

  updateStatus(event: any): void {
    let Observable = this.exerciceTypeService.updateExerciceTypes(this.exerciceType);
    Observable.subscribe({
      error: err => {
        Swal.fire("Erreur lors de la sauvegarde.\nCode d'erreur : " + err, '', 'error')
      }
    })
    this.navigateBack();
  }

  onSupprime(): void {
    Swal.fire({
      title: "Voulez vous réellement supprimer cette exercice ?",
      showDenyButton: true,
      confirmButtonText: "Supprimer",
      denyButtonText: `Annuler`
    }).then((result) => {
      if (result.isConfirmed) {
        let Observable = this.exerciceTypeService.deleteExerciceTypes(this.exerciceType.id);
        Observable.subscribe({
          next: routine => {
            Swal.fire("Type d'exercice supprimé !", "", "success");
            this.navigateBack();
          },
          error: err => {
            window.alert("Erreur lors de la suppression du type d'exercice.\nCode d'erreur : " + err)
            this.navigateBack();
          }
        })
      } else if (result.isDenied) {
        Swal.fire('Suppression annulée.', '', 'info');
      }
    });
  }

  private navigateBack(): void {
      this.router.navigateByUrl('/').then(() => this.router.navigateByUrl('/exercicestypes'))
  }
}
