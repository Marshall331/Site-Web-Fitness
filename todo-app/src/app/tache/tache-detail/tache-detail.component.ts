import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EtatTache, Tache } from 'src/app/models/tache';
import { TacheService } from 'src/app/services/tache.service';

@Component({
  selector: 'app-tache-detail',
  templateUrl: './tache-detail.component.html',
  styleUrls: ['./tache-detail.component.css']
})
export class TacheDetailComponent {

  tache : Tache|undefined
  readonly etatTache = EtatTache // transmettre l'enum au template

  constructor(
    private tacheService : TacheService,
    private router       : Router,
    private route        : ActivatedRoute
  ) {}

  ngOnInit(): void {
    const id  = this.route.snapshot.params['id']
    this.tacheService.getTache( id ).subscribe({
      next: tache => this.tache = tache,
      error:err   => this.router.navigateByUrl('/taches')
    })
  }

}
