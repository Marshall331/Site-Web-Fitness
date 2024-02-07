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
  public valBarreChargement: number = Math.random() * 100;

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
        this.playLoadingAnimation();
      },
      error: err => {
        Swal.fire('Erreur', 'Une erreur est survenue lors de la récupération des exercices.', 'error')
        this.navigateBack();
      }
    });
  }

  private playLoadingAnimation() {
    this.valBarreChargement = 100;
    setTimeout(() => {
      this.etatChargement = EtatChargement.FAIT;
    }, 50);
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
    console.log(this.selectedExercicesIds)

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
        this.valBarreChargement = Math.random() * 100;
        this.etatChargement = EtatChargement.ENCOURS;
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
          Swal.fire("Erreur lors de la suppression.\nCode d'erreur : " + err, '', 'error');
        },
        complete: () => {
          if (this.selectedExercicesIds.length == 0) {
            this.playLoadingAnimation();
            Swal.fire('Exercices supprimés !', '', 'success');
            this.navigateBack();
          } else {
            this.deleteExerciceRecursively();
          }
        }
      })
    };
  }
  private navigateBack(): void {
    if (this.routineId) {
      this.router.navigateByUrl('/').then(() => this.router.navigateByUrl('/routine/' + this.routineId));
    } else {
      this.router.navigateByUrl('/').then(() => this.router.navigateByUrl('/exercices'))
    }
  }
}