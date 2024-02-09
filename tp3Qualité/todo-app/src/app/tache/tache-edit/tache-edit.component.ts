import { Component } from '@angular/core';
import { NgForm } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router';
import { EtatTache, Tache } from 'src/app/models/tache';
import { TacheService } from 'src/app/services/tache.service';

@Component({
  selector: 'app-tache-edit',
  templateUrl: './tache-edit.component.html',
  styleUrls: ['./tache-edit.component.css']
})
export class TacheEditComponent {

  public tache:Tache = new Tache()
  readonly etatTache = EtatTache // transmettre l'enum au template

  public loading:boolean = true

  constructor(
    private tachesService : TacheService,
    private router        : Router,
    private route         : ActivatedRoute
  ) {}

  ngOnInit(): void {
    const idTache = this.route.snapshot.params["id"]
    this.tache = new Tache()
    if ( idTache ) {
      this.tachesService.getTache(idTache).subscribe({
        next: tache => {
          this.tache = {...tache}
          this.loading = false
        },
        error:err   => this.router.navigateByUrl('/taches')
      })
    } else {
      this.loading = false
    }
  }

  public onSubmit(leFormulaire: NgForm) : void {
    if (leFormulaire.valid) {
      let ObservableAction
      if (this.tache.id) {
        ObservableAction = this.tachesService.updateTache(this.tache)
      } else {
        ObservableAction = this.tachesService.addTache(this.tache)
      }
      ObservableAction.subscribe({
        next:  tache=> {
          console.log("Enregistrement OK : ",tache)
          this.router.navigateByUrl("/taches")
        },
        error: err  => {
          console.log("ERREUR de sauvegarde : ",err)
          // TODO amélioration possible avec la gestion d'un message pour l'utilisateur
        }
      })
    }
  }
}
