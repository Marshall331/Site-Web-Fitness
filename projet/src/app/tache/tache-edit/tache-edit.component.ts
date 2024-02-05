import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EtatChargement } from 'src/app/models/chargement';
import { EtatTache, Tache } from 'src/app/models/tache';
import { TacheService } from 'src/app/services/tache.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-tache-edit',
  templateUrl: './tache-edit.component.html',
  styleUrls: ['./tache-edit.component.css']
})
export class TacheEditComponent {

  public tache: Tache = new Tache();
  readonly etatTache = EtatTache;
  public etatChargement = EtatChargement.ENCOURS;

  constructor(
    private tacheService: TacheService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  public onSubmit(leFormulaire: NgForm): void {
    if (leFormulaire.valid) {
      let ObservableAction;
      if (this.tache.id) {
        ObservableAction = this.tacheService.updateTache(this.tache);
      } else {
        ObservableAction = this.tacheService.addTache(this.tache);
      }
      ObservableAction.subscribe({
        next: tache => {
          Swal.fire(this.tache.id ? "Tâche modifiée !" : "Tâche ajoutée !", '', 'success');
          this.router.navigateByUrl("/taches")
        },
        error: err => {
          Swal.fire("Erreur lors de la sauvegarde.\nCode d'erreur : " + err)
        }
      })
    }
  }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.tache = new Tache()
    if (id) {
      this.tacheService.getTache(id).subscribe(
        {
          next: tache => {
            this.tache = tache
            this.etatChargement = EtatChargement.FAIT
          },
          error: err => this.router.navigateByUrl('/taches')
        }
      )
    }
    else { this.etatChargement = EtatChargement.FAIT }
  }
}