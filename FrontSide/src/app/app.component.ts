import { Component } from '@angular/core';
import { RestserviceService } from './restservice.service';
import { World, Product, Pallier } from './world';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ISISCapitalist';
  world: World = new World();
  server: string;
  qtmulti = 1;
  nbManagerDebloquables = 0;

  constructor(private service: RestserviceService, private toastr: ToastrService) {
    this.server = service.getServer();
    service.getWorld().then(

      world => {
        this.world = world;
      });
  }

  showSuccess(message:string) {
    this.toastr.success(message, 'Aye comrade !',
      { timeOut: 2000 });;
  }
  showError() {
    this.toastr.error('everything is broken', 'Major Error', {
      timeOut: 3000
    });
  }

  onBuyDone(m: number) {
    this.world.money = this.world.money - m;
  }

  onProductionDone(p: Product) {  
    this.world.money = this.world.money + p.quantite * p.revenu * (1 + (this.world.activeangels * this.world.angelbonus / 100));
    this.world.score = this.world.score + p.quantite * p.revenu * (1 + (this.world.activeangels * this.world.angelbonus / 100));
    this.disponibiliteManager();
  }
  // Commutateur pour la valeur de quantité d'achat de produits.
  // Le max étant ici, par souci de simplicité, représenté par une grande valeur;
  commutateur() {
    switch (this.qtmulti) {
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

  achatManager(manager: Pallier) {
    this.showSuccess(manager.name + ' engagé');
    if (this.world.money >= manager.seuil) {
      this.world.money = this.world.money - manager.seuil;

      this.world.managers.pallier[this.world.managers.pallier.indexOf(manager)].unlocked = true;
      this.world.products.product.forEach(element => {
        if (manager.idcible == element.id) {
          this.world.products.product[this.world.products.product.indexOf(element)].managerUnlocked = true;
        }
      });
      
      //this.service.putManager(m);
    }
  }

  disponibiliteManager(): void {
    let nb = 0;
    this.nbManagerDebloquables = 0;
    this.world.managers.pallier.forEach(val => {
        if (this.world.money > val.seuil && !val.unlocked) {
          nb++;
        }
    })
    this.nbManagerDebloquables=nb;
  }
}

