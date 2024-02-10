import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EtatChargement } from 'src/app/models/chargement';
import { ExerciceTypes } from 'src/app/models/exercice-types';
import { ExerciceTypesService } from 'src/app/services/exercice-types.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-exercice-type-detail',
  templateUrl: './exercice-type-detail.component.html',
  styleUrls: ['./exercice-type-detail.component.css']
})
export class ExerciceTypeDetailComponent implements OnInit {

  /**
   * Objet représentant le type d'exercice.
   */
  public exerciceType!: ExerciceTypes;

  /**
   * État de chargement de la page.
   */
  public etatChargement = EtatChargement.ENCOURS;

  /**
   * Constructeur du composant ExerciceTypeDetailComponent.
   * @param exerciceTypeService Service permettant de gérer les types d'exercices.
   * @param router Service de routage pour la navigation dans l'application.
   * @param route Service qui permet de récupérer les informations de la route active.
   */
  constructor(
    private exerciceTypeService: ExerciceTypesService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  /**
   * Méthode appelée lors de l'initialisation du composant.
   * Récupère l'identifiant du type d'exercice depuis la route et charge les détails de cet exercice.
   */
  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];

    this.exerciceTypeService.getExerciceType(id).subscribe({
      next: exercice => {
        this.exerciceType = exercice;
        this.etatChargement = EtatChargement.FAIT;
      },
      error: err => {
        Swal.fire('Erreur', 'Une erreur est survenue lors de la récupération de l\'exercice.', 'error')
        this.router.navigateByUrl('/exercices-types');
      }
    });
  }
}