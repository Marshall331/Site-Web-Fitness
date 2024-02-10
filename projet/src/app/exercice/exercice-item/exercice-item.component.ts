/**
 * Composant représentant un élément d'exercice dans une liste.
 */
import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Exercice } from 'src/app/models/exercice';
import { ExerciceService } from 'src/app/services/exercice.service';

@Component({
  selector: 'app-exercice-item',
  templateUrl: './exercice-item.component.html',
  styleUrls: ['./exercice-item.component.css']
})
export class ExerciceItemComponent implements OnInit {

  @Input()
  public exercice: Exercice = new Exercice(); // Détails de l'exercice
  @Input()
  isSelected: boolean = false; // Indique si l'exercice est sélectionné
  @Output()
  checkboxChange: EventEmitter<boolean> = new EventEmitter<boolean>(); // Événement émis lors du changement de l'état de la case à cocher
  @Input()
  public routineId: number | undefined; // ID de la routine associée à l'exercice
  public isExerciceDone!: boolean; // Indique si l'exercice est marqué comme terminé

  /**
   * Constructeur de ExerciceItemComponent.
   * @param exerciceService Le service pour la gestion des exercices
   * @param router Le routeur pour la navigation
   */
  constructor(
    private exerciceService: ExerciceService,
    private router: Router,
  ) {}

  /**
   * Hook de cycle de vie appelé après que Angular ait initialisé toutes les propriétés liées aux données d'une directive.
   */
  ngOnInit(): void {
    this.initializeRoutine();
  }

  /**
   * Initialise l'état de l'exercice en fonction de son statut dans le stockage local.
   */
  private initializeRoutine(): void {
    const routinesDoneIds = JSON.parse(localStorage.getItem('exerciceDoneIds') || '[]') as number[];
    const index = routinesDoneIds.indexOf(this.exercice.id);
    if (index !== -1) {
      this.isExerciceDone = true;
    }
  }

  /**
   * Met à jour le statut de l'exercice (terminé/non terminé) dans le stockage local.
   */
  updateRoutineDoneStatus() {
    if (this.exercice.id) {
      const routinesDoneIds = JSON.parse(localStorage.getItem('exerciceDoneIds') || '[]') as number[];
      const index = routinesDoneIds.indexOf(this.exercice.id);
      if (index === -1) {
        routinesDoneIds.push(this.exercice.id);
        localStorage.setItem('exerciceDoneIds', JSON.stringify(routinesDoneIds));
        this.isExerciceDone = true;
      } else {
        routinesDoneIds.splice(index, 1);
        localStorage.setItem('exerciceDoneIds', JSON.stringify(routinesDoneIds));
        this.isExerciceDone = false;
      }
    }
  }

  /**
   * Gère l'événement de changement de la case à cocher.
   * @param event L'événement déclenché lors du changement de la case à cocher
   */
  onCheckboxChange(event: any): void {
    this.checkboxChange.emit(event.target.checked);
  }

  /**
   * Gère l'événement de suppression de l'exercice.
   */
  onSupprime(): void {
    Swal.fire({
      title: "Voulez-vous réellement supprimer cet exercice ?",
      showDenyButton: true,
      confirmButtonText: "Supprimer",
      denyButtonText: `Annuler`
    }).then((result) => {
      if (result.isConfirmed) {
        let Observable = this.exerciceService.deleteExercice(this.exercice.id);
        Observable.subscribe({
          next: () => {
            Swal.fire("Exercice supprimé !", "", "success");
            this.navigateBack();
          },
          error: () => {
            Swal.fire("Erreur lors de la suppression de l'exercice.",'','error');
            this.navigateBack();
          }
        })
      } else if (result.isDenied) {
        Swal.fire('Suppression annulée.', '', 'info');
      }
    });
  }

  /**
   * Navigue en arrière après la suppression de l'exercice.
   */
  private navigateBack(): void {
    if (this.routineId) {
      this.router.navigateByUrl('/').then(() => this.router.navigateByUrl('/routine/' + this.routineId));
    } else {
      this.router.navigateByUrl('/').then(() => this.router.navigateByUrl('/exercices'))
    }
  }
}