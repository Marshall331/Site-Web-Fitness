import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { EtatChargement } from 'src/app/models/chargement';
import { EtatRoutine, Routine } from 'src/app/models/routine';
import { EtatTache, Tache } from 'src/app/models/tache';
import { RoutineService } from 'src/app/services/routine.service';
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
        this.router.navigateByUrl('/routines');
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
    this.exerciceBySearch = this.filterTaches(this.exerciceList);
  }

  isTaskSelected(exerciceId: number): boolean {
    return this.selectedExercicesIds.includes(exerciceId);
  }

  private filterTaches(exerciceList: Exercice[]): Exercice[] {
    return exerciceList.filter(exercice => this.isRechercheMatch(exercice));
  }

  private isRechercheMatch(exercice: Exercice): boolean {
    const rechercheLower = this.recherche.toLowerCase().replace(/\s/g, '');
    const exerciceNomSansEspaces = exercice.name.toLowerCase().replace(/\s/g, '');

    return (
      exerciceNomSansEspaces.includes(rechercheLower)
    );
  }

  // Nouvelle méthode pour la gestion des erreurs
  handleError(error: any): void {
    this.etatChargement = EtatChargement.ERREUR;
    console.error('Erreur lors de la sauvegarde.', error);
  }

  updateRoutine(exercice: Exercice): Observable<Exercice> {
    return this.exerciceService.updateExercice(exercice);
  }

  updateLoadingState(error: boolean): void {
    this.etatChargement = error ? EtatChargement.ERREUR : EtatChargement.FAIT;
  }

  navigateToExercices(): void {
    this.router.navigateByUrl('/').then(() => this.router.navigateByUrl('/routines'));
  }

  showNotification(error: boolean, errorCode?: any): void {
    Swal.fire(error ? `Erreur lors de la sauvegarde.\nCode d'erreur : ${errorCode}` : 'Routines modifiées !');
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
      title: 'Voulez-vous réellement supprimer ces tâches ?',
      showDenyButton: true,
      confirmButtonText: 'Supprimer',
      denyButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        let observable = this.exerciceService.deleteMultipleExercices(this.selectedExercicesIds);
        observable.subscribe({
          next: () => {
            this.router.navigateByUrl('/').then(() => this.router.navigateByUrl('/taches'));
            Swal.fire('Tâches supprimées !', '', 'success');
          },
          error: (err) => {
            Swal.fire("Erreur lors de la suppression.\nCode d'erreur : " + err, '', 'error');
          }
        });
      } else if (result.isDenied) {
        Swal.fire('Suppression annulée', '', 'info');
      }
    });
  }
}