import { Component } from '@angular/core';
import { RestserviceService } from './restservice.service';
import { World, Product, Pallier } from './world';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ISISCapitalist';
  world: World = new World();
  server: string;
  qtmulti= 1;

  constructor(private service: RestserviceService) {
    this.server = service.getServer();
    service.getWorld().then(

    world => {
      this.world = world;
    });
  }

  onBuyDone(m: number) {
    this.world.money = this.world.money - m;
  }

  onProductionDone(p: Product) {
    this.world.money = this.world.money + p.quantite * p.revenu * (1 + (this.world.activeangels * this.world.angelbonus / 100));
    this.world.score = this.world.score + p.quantite * p.revenu * (1 + (this.world.activeangels * this.world.angelbonus / 100));
  }
  // Commutateur pour la valeur de quantité d'achat de produits.
  // Le max étant ici, par souci de simplicité, représenté par une grande valeur;
  commutateur(){
    switch(this.qtmulti){
      case 1:
        this.qtmulti = 10;
        break;
      case 10:
        this.qtmulti = 100;
        break;
      case 100:
        this.qtmulti = 100000;
        break;
      default:
        this.qtmulti = 1;
    }
  }
}

