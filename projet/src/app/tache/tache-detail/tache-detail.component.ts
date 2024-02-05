import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { EtatChargement } from 'src/app/models/chargement';
import { Tache } from 'src/app/models/tache';
import { TacheService } from 'src/app/services/tache.service';

@Component({
  selector: 'app-tache-detail ',
  templateUrl: './tache-detail.component.html',
  styleUrls: ['./tache-detail.component.css']
})
export class TacheDetailComponent {

  public tache: Tache = new Tache();
  public etatTache: any;
  public etatChargement = EtatChargement.ENCOURS;

  constructor(
    private tacheService: TacheService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
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
}
