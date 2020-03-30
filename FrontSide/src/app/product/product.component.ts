import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {World, Product, Pallier} from '../world';
import {ThemePalette} from '@angular/material/core';
import {ProgressBarMode} from '@angular/material/progress-bar';
import { NotificationService } from '../notification.service';

declare var require;
const ProgressBar = require('progressbar.js');

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css',
    './product.component.css'
  ]
})


export class ProductComponent implements OnInit, AfterViewInit {
  product: Product;
  color: ThemePalette = 'primary';
  mode: ProgressBarMode = 'determinate';
  value = 50;
  bufferValue = 75;
  bar: any;
  isRun: boolean;
  lastupdate: number;
  progress: any;
  maxBuy: number;
  seuil: number;

  // On stocke l'argent du joueur.
  // tslint:disable-next-line:variable-name
  _money: number;
  @Input()
  set money(value: number) {
    this._money = value;
  }

  @Input()
  set prod(value: Product) {
    this.product = value;

    // On fixe le coût d'achat.
    this.maxBuy = this.product.cout;

    // On vérifie si un manager est déverrouillé et si la production est lancé pour
    // Faire les différentes mises à jour.
    if (this.product.managerUnlocked && this.product.timeleft > 0) {
      this.lastupdate = Date.now();
      this.progress = (this.product.vitesse - this.product.timeleft) / this.product.vitesse;
      this.bar.animate(1, {duration: this.progress});
    }
  }

  // On récupère le commutateur utilisé pour la quantité d'achat.
  // tslint:disable-next-line:variable-name
  _qtmulti: number;
  @Input()
  set qtmulti(value: number) {
    if (value >= 100000) {
      this._qtmulti = this.calcMaxCanBuy();
    } else {
      this._qtmulti = value;
    }
  }

  @ViewChild('bar') progressBarItem;
  // On renvoie à la couche mère (l'app) la mise en production d'un Produit
  @Output() notifyProduction: EventEmitter<Product> = new EventEmitter<Product>();
  // On renvoie à la couche-mère (l'app) la mise à jour de la money
  @Output() notifyMoney: EventEmitter<number> = new EventEmitter<number>();

  constructor(private notifyService: NotificationService) {
  }

  ngOnInit(): void {
    setInterval(() => {
      this.calcScore();
    }, 100);
  }

  ngAfterViewInit() {
    // Pour avoir un affichage correct de la progressbar
    setTimeout(() => {
      this.bar = new ProgressBar.Line(this.progressBarItem.nativeElement, {
        strokeWidth: 4,
        easing: 'easeInOut',
        color: '#FFEA82',
        trailColor: '#eee',
        trailWidth: 1,
        svgStyle: {width: '100%', height: '100%'},
        from: {color: '#FFEA82'},
        to: {color: '#ED6A5A'},
        step: (state, bar) => {
          bar.path.setAttribute('stroke', state.color);
        }
      });
    }, 100);
  }

  production() {
    if (this.product.quantite >= 1) {
      const progress = (this.product.vitesse - this.product.timeleft) / this.product.vitesse;
      this.bar.animate(1, {duration: progress});
      // On dit que la production est en cours, on notifie la dernière modification.
      this.isRun = true;
      this.lastupdate = Date.now();
      // Enfin, ici, on initialise le temps restant à la vitesse de production.
      this.product.timeleft = this.product.vitesse;

      // On notifie la couche supérieure que la production est effectuée.
      this.notifyProduction.emit(this.product);
    }
  }

  achatProduct() {
    console.log(this._qtmulti);
    if (this._money >= (this.product.cout * this._qtmulti)) {

      const coutAchat = this.product.cout * this._qtmulti;
      this.product.quantite = this.product.quantite + this._qtmulti;
      this.notifyMoney.emit(coutAchat);


      this.product.palliers.pallier.forEach(value => {
        if (!value.unlocked && this.product.quantite > value.seuil) {
          this.product.palliers.pallier[this.product.palliers.pallier.indexOf(value)].unlocked = true;
          this.calcUpgrade(value);
          this.notifyService.showSuccess('déblocage d\'un bonus ' + value.typeratio + ' effectué pour ' + this.product.name, 'BONUS');
        }
      });
    }
  }

  calcScore() {
    if (this.isRun) {
      if (this.product.timeleft > 0) {
        this.product.timeleft = this.product.timeleft - (Date.now() - this.lastupdate);
      } else {
        this.product.timeleft = 0;
        this.lastupdate = 0;
        this.isRun = false;
        this.bar.set(0);
      }
    }
    if (this.product.managerUnlocked) {
      this.production();
    }
  }

  // On calcule ici la quantité maximale d'achat possible d'un produit en fonction de
  // l'argent du joueur.
  calcMaxCanBuy(): number {
    let quantiteMax = 0;
    if (this.product.cout * this.product.croissance <= this._money) {
      const calPrelem = (this.product.cout - (this._money * (1 - this.product.croissance))) / this.product.cout;
      const quant = (Math.log(calPrelem)) / Math.log(this.product.croissance);
      quantiteMax = Math.trunc(quant - 1);
      if (isNaN(quantiteMax)) {
        quantiteMax = 0;
      }

    }
    return quantiteMax;
  }

  // On calcule ici selon si un bonus est débloqué ou non.
  calcUpgrade(pallier: Pallier) {
    switch (pallier.typeratio) {
      case 'vitesse':
        this.product.vitesse = this.product.vitesse / pallier.ratio;
        break;
      case 'gain':
        this.product.revenu = this.product.revenu * pallier.ratio;
        break;
    }
  }
}
