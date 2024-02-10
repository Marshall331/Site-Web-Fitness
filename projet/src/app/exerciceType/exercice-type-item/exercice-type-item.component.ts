import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ExerciceTypes } from 'src/app/models/exercice-types';
import { ExerciceTypesService } from 'src/app/services/exercice-types.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-exercice-type-item',
  templateUrl: './exercice-type-item.component.html',
  styleUrls: ['./exercice-type-item.component.css']
})
export class ExerciceTypeItemComponent {

  /**
   * Type d'exercice à afficher.
   */
  @Input()
  public exerciceType: ExerciceTypes = new ExerciceTypes();

  /**
   * Booléen indiquant si l'exercice est sélectionné.
   */
  @Input()
  isSelected: boolean = false;

  /**
   * Événement émis lors du changement de l'état de la case à cocher.
   */
  @Output()
  checkboxChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  /**
   * Identifiant de la routine.
   */
  @Input()
  public routineId: number | undefined;

  /**
   * Constructeur du composant ExerciceTypeItemComponent.
   * @param exerciceTypeService Service permettant de gérer les types d'exercices.
   * @param router Service de routage pour la navigation dans l'application.
   */
  constructor(
    private exerciceTypeService: ExerciceTypesService,
    private router: Router,
  ) { }

  /**
   * Méthode appelée lors du changement de l'état de la case à cocher.
   * @param event Événement de changement de la case à cocher.
   */
  onCheckboxChange(event: any): void {
    this.checkboxChange.emit(event.target.checked);
  }

  /**
   * Met à jour le statut de l'exercice.
   * @param event Événement de mise à jour du statut.
   */
  updateStatus(event: any): void {
    let Observable = this.exerciceTypeService.updateExerciceTypes(this.exerciceType);
    Observable.subscribe({
      error: err => {
        Swal.fire("Erreur lors de la sauvegarde.\nCode d'erreur : " + err, '', 'error')
      }
    })
    this.navigateBack();
  }

  /**
   * Supprime le type d'exercice.
   */
  onSupprime(): void {
    Swal.fire({
      title: "Voulez-vous réellement supprimer ce type d'exercice ?",
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
            Swal.fire("Erreur lors de la suppression du type d'exercice.", '', 'error');
            this.navigateBack();
          }
        })
      } else if (result.isDenied) {
        Swal.fire('Suppression annulée.', '', 'info');
      }
    });
  }

  /**
   * Navigue en arrière vers la liste des types d'exercices.
   */
  private navigateBack(): void {
    this.router.navigateByUrl('/').then(() => this.router.navigateByUrl('/exercicestypes'))
  }
}