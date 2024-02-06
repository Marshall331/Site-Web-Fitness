import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EtatChargement } from 'src/app/models/chargement';
import { Exercice } from 'src/app/models/exercice';
import { ExerciceService } from 'src/app/services/exercice.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-exercice-edit',
  templateUrl: './exercice-edit.component.html',
  styleUrls: ['./exercice-edit.component.css']
})
export class ExerciceEditComponent {

  public exercice: Exercice = new Exercice();
  public etatChargement = EtatChargement.ENCOURS;
  public exerciceList!:Exercice[];

  constructor(
    private exerciceService: ExerciceService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    
   }

  public onSubmit(leFormulaire: NgForm): void {
    if (leFormulaire.valid) {
      let ObservableAction;
      if (this.exercice.id) {
        ObservableAction = this.exerciceService.updateExercice(this.exercice);
      } else {
        ObservableAction = this.exerciceService.addExercice(this.exercice);
      }
      ObservableAction.subscribe({
        next: (exercice: any) => {
          Swal.fire(this.exercice.id ? "Exercice modifiée !" : "Exercice ajouté !", '', 'success');
          this.router.navigateByUrl("/exercices")
        },
        error: (err: string) => {
          Swal.fire("Erreur lors de la sauvegarde.\nCode d'erreur : " + err)
        }
      })
    }
  }

  ngOnInit(): void {
    this.exerciceService.getExercices().subscribe({
      next: exercices => {
        this.exerciceList = exercices;
      },
      error: err => {
        Swal.fire('Erreur', 'Une erreur est survenue lors de la récupération des exercices.', 'error')
        this.router.navigateByUrl('/exercices');
      }
    });
    const id = this.route.snapshot.params['id'];
    this.exercice = new Exercice()
    if (id) {
      this.exerciceService.getExercice(id).subscribe(
        {
          next: (exo: Exercice) => {
            this.exercice = exo
            this.etatChargement = EtatChargement.FAIT
          },
          error: (err: any) => this.router.navigateByUrl('/exercices')
        }
      )
    }
    else { this.etatChargement = EtatChargement.FAIT }
  }
}