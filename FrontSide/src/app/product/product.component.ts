import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {Product} from '../world';
import {ThemePalette} from '@angular/material/core';
import {ProgressBarMode} from '@angular/material/progress-bar';

declare var require;
const ProgressBar = require('progressbar.js');

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})


export class ProductComponent implements OnInit, AfterViewInit {
  product: Product;
  color: ThemePalette = 'primary';
  mode: ProgressBarMode = 'determinate';
  value = 50;
  bufferValue = 75;
  progressbar: any;
  isRun: boolean;
  lastupdate: number;
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
  @Output() notifyProduction: EventEmitter<Product> = new EventEmitter<Product>();
  @Output() notifyMoney: EventEmitter<number> = new EventEmitter<number>();

  constructor() { }

  ngOnInit(): void {
    setInterval(() => {
      this.calcScore();
    }, 100);
  }

  ngAfterViewInit() {
    // On utilise ce timeout pour initialiser la progressbar seulement
    // à l'affichage du DOM. Autrmeent, des "rebonds" étaient constatés,
    // faussant le calcul.
    setTimeout(() => {
      this.progressbar = new ProgressBar.Line(this.progressBarItem.nativeElement, {
        strokeWidth: 4,
        easing: 'easeInOut',
        color: '#FFEA82',
        trailColor: '#eee',
        trailWidth: 1,
        svgStyle: { width: '100%', height: '100%' },
        from: { color: '#FFEA82' },
        to: { color: '#ED6A5A' },
        step: (state, bar) => {
          bar.path.setAttribute('stroke', state.color);
        }
      });
    }, 100);
  }
  production() {
    if (this.product.quantite >= 1) {
      const progress = (this.product.vitesse - this.product.timeleft) / this.product.vitesse;
      this.progressbar.animate(1, { duration: this.product.vitesse });
      this.product.timeleft = this.product.vitesse;
      this.lastupdate = Date.now();
      this.isRun = true;
      console.log('test2');
    }
  }

  achatProduct() {
    // console.log(this.calcMaxCanBuy())
    console.log("oui");
    if (this._qtmulti <= this.calcMaxCanBuy()) {
      const coutAchat = this.product.cout * this._qtmulti;
      this.product.quantite = this.product.quantite + this._qtmulti;
      this.notifyMoney.emit(coutAchat);
      // bonus d'achat spécifique à chaque produit
      this.product.palliers.pallier.forEach(value => {
        if (!value.unlocked && this.product.quantite > value.seuil) {
          this.product.palliers.pallier[this.product.palliers.pallier.indexOf(value)].unlocked = true;
          //this.calcUpgrade(value);
          //this.notifyService.showSuccess('déblocage d\'un bonus ' + value.typeratio + ' effectué pour ' + this.product.name, 'BONUS');
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
        this.progressbar.set(0);
      }
      this.notifyProduction.emit(this.product);
    }
  }
  calcMaxCanBuy(): number {
    let quantiteMax = 0;
    let maxim = 0;
    let max = 1;
    while (maxim < this._money) {
      max = max * this.product.cout;
      maxim = maxim + max;
      quantiteMax = quantiteMax + 1;
      if (this.product.cout > this._money) {
        quantiteMax = 0;
      }
    }
    return quantiteMax;
  }
}
