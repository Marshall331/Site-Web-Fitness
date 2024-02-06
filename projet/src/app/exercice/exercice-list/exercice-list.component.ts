import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { EtatChargement } from 'src/app/models/chargement';
import Swal from 'sweetalert2';
import { NgForm } from '@angular/forms';
import { Exercice } from 'src/app/models/exercice';
import { ExerciceService } from 'src/app/services/exercice.service';


@Component({
  selector: 'app-exercice-list',
  templateUrl: './exercice-list.component.html',
  styleUrls: ['./exercice-list.component.css']
})
export class ExerciceListComponent implements OnInit {

  @Input()
  public routineId: number = 0;
  public selectAllChecked: boolean = false;
  public selectedExercicesStates: Map<number, boolean> = new Map<number, boolean>();
  public selectedExercicesIds: number[] = [];
  public recherche: string = "";
  public exercices!: Observable<Exercice[]>;
  public exerciceList: Exercice[] = [];
  public exerciceBySearch: Exercice[] = [];
  public etatChargement: EtatChargement = EtatChargement.ENCOURS;

  constructor(
    private exerciceService: ExerciceService,
    private router: Router,
  ) {
    this.recherche = sessionStorage['rechercheExercice'] || "";
  }

  ngOnInit(): void {
    this.exercices = this.exerciceService.getExercices();
    this.getExercicesById(this.routineId);
  }

  getExercicesById(id: number): void {
    this.exerciceService.getExercices().subscribe({
      next: exercices => {
        if (this.routineId == 0) {
          this.exerciceList = exercices;
        } else {
          for (const exo of exercices) {
            if (exo.routineId == id) {
              this.exerciceList.push(exo);
            }
          }
        }
        this.subscribeToExercices();
        this.etatChargement = EtatChargement.FAIT;
      },
      error: err => {
        Swal.fire('Erreur', 'Une erreur est survenue lors de la récupération des exercices.', 'error')
        this.router.navigateByUrl('/exercices');
      }
    });
    this.exerciceBySearch = this.exerciceList;
  }

  updateRecherche($event: Event) {
    this.recherche = $event.toString();
    sessionStorage['rechercheExercice'] = this.recherche;
    this.subscribeToExercices();
  }

  private subscribeToExercices() {
    this.exerciceBySearch = this.filtrerExercices(this.exerciceList);
  }

  isTaskSelected(exerciceId: number): boolean {
    return this.selectedExercicesIds.includes(exerciceId);
  }

  private filtrerExercices(exerciceList: Exercice[]): Exercice[] {
    return exerciceList.filter(exercice => this.isRechercheMatch(exercice));
  }

  private isRechercheMatch(exercice: Exercice): boolean {
    const rechercheLower = this.recherche.toLowerCase().replace(/\s/g, '');
    const exerciceNomSansEspaces = exercice.name.toLowerCase().replace(/\s/g, '');

    return (
      exerciceNomSansEspaces.includes(rechercheLower)
    );
  }

  toggleSelectAll() {
    this.selectedExercicesIds = [];

    for (const exo of this.exerciceBySearch) {
      this.selectedExercicesStates.set(exo.id, this.selectAllChecked);
      if (this.selectAllChecked) {
        this.selectedExercicesIds.push(exo.id);
      }
    }
  }

  onTaskCheckboxChange(isSelected: boolean, exerciceId: number): void {
    if (isSelected) {
      this.selectedExercicesIds.push(exerciceId);
    } else {
      const index = this.selectedExercicesIds.indexOf(exerciceId);
      if (index !== -1) {
        this.selectedExercicesIds.splice(index, 1);
      }
    }
  }

  onSupprime(): void {
    Swal.fire({
      title: 'Voulez-vous réellement supprimer ces exercices ?',
      showDenyButton: true,
      confirmButtonText: 'Supprimer',
      denyButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteMultipleExercices();
      } else if (result.isDenied) {
        Swal.fire('Suppression annulée', '', 'info');
      }
    });
  }

  private deleteMultipleExercices(): void {
    let successfulDeletions = 0;
    let totalDeletions = this.selectedExercicesIds.length;

    this.selectedExercicesIds.forEach(id => {
      let deleteObservable  = this.exerciceService.deleteExercice(id);
      deleteObservable.subscribe({
        next: () => {
          successfulDeletions++;
          if (successfulDeletions === totalDeletions) {
            Swal.fire('Tous les exercices ont été supprimés avec succès !', '', 'success');
            this.router.navigateByUrl('/').then(() => this.router.navigateByUrl('/exercices'));
          }
        },
        error: (err) => {
          Swal.fire("Erreur lors de la suppression.\nCode d'erreur : " + err, '', 'error');
        }
      });
    });
  }
}