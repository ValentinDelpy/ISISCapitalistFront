import {Component, QueryList, ViewChildren} from '@angular/core';
import { RestserviceService } from './restservice.service';
import { World, Product, Pallier } from './world';
import {NotificationService} from './notification.service';
import {ProductComponent} from './product/product.component';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ISISCapitalist';
  world: World = new World();
  server: string;
  username: string;
  qtmulti = 1;
  managerAvailable: boolean;
  upgradeAvailable: boolean;

  @ViewChildren(ProductComponent) public productsComponent: QueryList<ProductComponent>;


  constructor(private service: RestserviceService, private notifyService: NotificationService) {
    this.server = service.getServer();
    this.createUsername();
    service.getWorld().then(world => {
      this.world = world;
    });

  }


  disponibiliteManager(): void {
    this.managerAvailable = false;
    this.world.managers.pallier.forEach(val => {
      if (!this.managerAvailable) {
        if (this.world.money > val.seuil && !val.unlocked) {
          this.managerAvailable = true;
        }
      }
    });
  }
  // on test la disponibité la disponibilité des upgrades
  disponibiliteUpgrades() {
    this.upgradeAvailable = false;
    this.world.upgrades.pallier.map(upgrade => {
      if (!this.upgradeAvailable) {
        if (!upgrade.unlocked && this.world.money > upgrade.seuil) {
          this.upgradeAvailable = true;
        }
      }
    });
  }

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

  onProductionDone(p: Product) {
    this.world.money = this.world.money + p.quantite * p.revenu * (1 + (this.world.activeangels * this.world.angelbonus / 100));
    this.world.score = this.world.score + p.quantite * p.revenu * (1 + (this.world.activeangels * this.world.angelbonus / 100));
    // Un manager est-il disponible ?
    this.disponibiliteManager();
    // Des améliorations sont elles disponibles ?
    this.disponibiliteUpgrades();
  }


  onAchatDone(m: number) {
    this.world.money = this.world.money - m;

    // Vérification des différentes améliorations, bonus, manager.
    this.bonusAllunlock();
    this.disponibiliteManager();
    this.disponibiliteUpgrades();
  }

  // ici on enregistre les changements de nom d'utilisateur effectué par l'utilisateur
  onUsernameChanged(): void {
    localStorage.setItem('username', this.username);
    this.service.setUser(this.username);
  }

  // Création de l'username, enregistrement côté serveur s'il n'existe pas.
  createUsername(): void {
    this.username = localStorage.getItem('username');
    if (this.username === '') {
      this.username = 'Camarade' + Math.floor(Math.random() * 10000);
      localStorage.setItem('username', this.username);
    }
    this.service.setUser(this.username);
  }

  // cette partie nous permet d'acheter un manager
  achatManager(m: Pallier) {
    if (this.world.money >= m.seuil) {
      this.world.money = this.world.money - m.seuil;

      this.world.managers.pallier[this.world.managers.pallier.indexOf(m)].unlocked = true;

      this.world.products.product.forEach(element => {
        if (m.idcible == element.id) {
          this.world.products.product[this.world.products.product.indexOf(element)].managerUnlocked = true;
        }
      });
      this.disponibiliteManager();
      this.notifyService.showSuccess('Achat de ' + m.name + ' effectué', 'Manager');
    }
  }
  // ici on lance l'achat d'un upgrade en fonction de l'argent du joueur et du click sur le bouton d'achat
  achatUpgrade(p: Pallier) {
    if (this.world.money > p.seuil) {
      this.world.money = this.world.money - p.seuil;
      this.world.upgrades.pallier[this.world.upgrades.pallier.indexOf(p)].unlocked = true;
      // si l'idcible est de 0, on applique l'upgrade sur tous les produits, sinon on recherche le produit concerné
      if (p.idcible == 0) {
        this.productsComponent.forEach(prod => prod.calcUpgrade(p));
        this.notifyService.showSuccess('achat d\'un upgrade de ' + p.typeratio + ' pour tous les produits', 'Upgrade global');
      } else {
        this.productsComponent.forEach(prod => {
          if (p.idcible == prod.product.id) {
            prod.calcUpgrade(p);
            this.notifyService.showSuccess('achat d\'un upgrade de ' + p.typeratio + ' pour ' + prod.product.name, 'Upgrade');
          }
        });
      }
      this.disponibiliteUpgrades();
    }
  }

  bonusAllunlock() {
    // on recherche la quantité minmal des produits
    const minQuantite = Math.min(
      ...this.productsComponent.map(p => p.product.quantite)
    );
    this.world.allunlocks.pallier.map(value => {
      // si la quantité minimal dépasse le seuil, on débloque le produit concerné
      if (!value.unlocked && minQuantite >= value.seuil) {
        this.world.allunlocks.pallier[this.world.allunlocks.pallier.indexOf(value)].unlocked = true;
        this.productsComponent.forEach(prod => prod.calcUpgrade(value));
        this.notifyService.showSuccess('Bonus de ' + value.typeratio + ' effectué sur tous les produits', 'bonus global');
      }
    });
  }

}

