import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
  public nbRepetitionsTotal: number = 0;
  public nbPoidsTotal: number = 0;
  public valBarreChargement!: number;
  public selectionChoice: String = "";
  public filterChoosen: string;

  constructor(
    private exerciceService: ExerciceService,
    private router: Router,
  ) {
    this.filterChoosen = sessionStorage['filtreExercice'] || "tout";
    this.recherche = sessionStorage['rechercheExercice'] || "";
  }

  ngOnInit(): void {
    this.startLoadingAnimation();
    this.exercices = this.exerciceService.getExercices();
    this.getExercicesById(this.routineId);
  }

  private getExercicesById(id: number): void {
    let observable;
    if (this.routineId == 0) {
      observable = this.exerciceService.getExercices();
    } else {
      observable = this.exerciceService.getExercicesByRoutineId(this.routineId);
    }
    observable.subscribe({
      next: exercices => {
        this.exerciceList = exercices;
        this.exerciceBySearch = this.exerciceList;
        this.calculerInfosSuppTotal();
        this.subscribeToExercices();
        this.playEndProgressBar(EtatChargement.FAIT);
      },
      error: err => {
        this.playEndProgressBar(EtatChargement.ERREUR).then(() => {
          Swal.fire('Erreur', 'Une erreur est survenue lors de la récupération des exercices.', 'error')
        });
      }
    });
  }

  updateEtatSelection(): void {
    Swal.fire({
      title: 'Passer le statut des exercices sélectionnés à l\'état : ' + this.selectionChoice + '?',
      showDenyButton: true,
      confirmButtonText: 'Confirmer',
      denyButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.startLoadingAnimation();
        if (this.selectionChoice === "fait") {
          this.updateExercicesDone(true);
        } else {
          this.updateExercicesDone(false);
        }
      }
      this.selectionChoice = "";
    });
  }

  updateFilter($event: Event) {
    this.filterChoosen = $event as unknown as string;
    sessionStorage['filtreExercice'] = this.filterChoosen;
    this.subscribeToExercices();
  }

  private updateExercicesDone(shouldAdd: boolean) {
    this.selectedExercicesIds.forEach(id => {
      this.updateExerciceDoneStatus(shouldAdd, id);
    });
    this.playEndProgressBar(EtatChargement.FAIT);
  }

  private checkDoneStatus(id: number): boolean {
    let routinesDoneIds = JSON.parse(localStorage.getItem('exerciceDoneIds') || '[]') as number[];
    const index = routinesDoneIds.indexOf(id);
    return index == -1;
  }

  private filterByRecherche(exercicesList: Exercice[]): Exercice[] {
    return exercicesList.filter(exercice => this.isRechercheMatch(exercice));
  }

  private updateExerciceDoneStatus(shouldAdd: boolean, exerciceId: number): void {
    let exercicesDoneIds = JSON.parse(localStorage.getItem('exerciceDoneIds') || '[]') as number[];
    const index = exercicesDoneIds.indexOf(exerciceId);
    if (shouldAdd) {
      if (index === -1) {
        exercicesDoneIds.push(exerciceId);
      }
    } else {
      if (index !== -1) {
        exercicesDoneIds.splice(index, 1);
      }
    }
    localStorage.setItem('exerciceDoneIds', JSON.stringify(exercicesDoneIds));
  }

  private calculerInfosSuppTotal() {
    this.exerciceList.forEach(exercice => {
      this.nbRepetitionsTotal += exercice.repetitions;
      this.nbPoidsTotal += exercice.weight;
    })
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
    switch (this.filterChoosen) {
      case "tout":
        return this.filterByRecherche(exerciceList);
      case "fait":
        return exerciceList.filter(exercice => !this.checkDoneStatus(exercice.id) && this.isRechercheMatch(exercice));
      case "non fait":
        return exerciceList.filter(exercice => this.checkDoneStatus(exercice.id) && this.isRechercheMatch(exercice));
      default:
        return this.filterByRecherche(exerciceList);
    }
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
        this.startLoadingAnimation();
        this.deleteExerciceRecursively();
      } else if (result.isDenied) {
        Swal.fire('Suppression annulée', '', 'info');
      }
    });
  }

  private deleteExerciceRecursively(): void {
    const id = this.selectedExercicesIds[0];
    this.selectedExercicesIds.splice(0, 1);
    if (id) {
      const deleteObservable = this.exerciceService.deleteExercice(id);
      deleteObservable.subscribe({
        error: (err) => {
          this.playEndProgressBar(EtatChargement.ERREUR);
        },
        complete: () => {
          if (this.selectedExercicesIds.length == 0) {
            this.playEndProgressBar(EtatChargement.FAIT).then(() => {
              Swal.fire('Exercices supprimés !', '', 'success');
              this.redirectToRightPage();
            });
          } else {
            this.deleteExerciceRecursively();
          }
        }
      })
    };
  }

  private redirectToRightPage(): void {
    if (this.routineId) {
      this.redirectToRoutine();
    } else {
      this.redirectToExercices();
    }
  }

  // Nouvelle méthode pour rediriger vers la page '/routines'
  private redirectToRoutine(): void {
    this.router.navigateByUrl('/').then(() => this.router.navigateByUrl('/routine/' + this.routineId));
  }

  // Nouvelle méthode pour rediriger vers la page '/routines'
  private redirectToExercices(): void {
    this.router.navigateByUrl('/').then(() => this.router.navigateByUrl('/exercices'))
  }

  private playEndProgressBar(loadingState: EtatChargement): Promise<void> {
    return new Promise((resolve) => {
      this.valBarreChargement = 100;
      setTimeout(() => {
        this.etatChargement = loadingState;
        resolve();
      }, 50);
    });
  }

  private startLoadingAnimation() {
    this.valBarreChargement = Math.random() * 100;
    this.etatChargement = EtatChargement.ENCOURS;
  }
}