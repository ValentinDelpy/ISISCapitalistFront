import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
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
  progress: any;
  bar: any;
  isRun: boolean;
  lastupdate: number;
  maxAchat: number;

  // tslint:disable-next-line:variable-name
  _money: number;
  @Input()
  set money(value: number) {
    this._money = value;
  }

  @Input()
  set prod(value: Product) {
    this.product = value;
    this.maxAchat = this.product.cout;
    if (this.product.managerUnlocked && this.product.timeleft > 0) {
      this.lastupdate = Date.now();
      this.progress = (this.product.vitesse - this.product.timeleft) / this.product.vitesse;
      this.bar.animate(1, { duration: this.progress });
    }
  }


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

  @ViewChild('bar') progressBarItem: ElementRef;
  @Output() notifyProduction: EventEmitter<Product> = new EventEmitter<Product>();
  @Output() notifyMoney: EventEmitter<number> = new EventEmitter<number>();

  constructor() { }

  ngOnInit(): void {
    setInterval(() => {
      this.calcScore();
    }, 100);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.bar = new ProgressBar.Line(this.progressBarItem.nativeElement, {
        strokeWidth: 4,
        easing: 'easeInOut',
        color: '#ffff00',
        trailColor: '#eee',
        trailWidth: 1,
        svgStyle: { width: '100%', height: '100%' },
        from: { color: '#ffff00' },
        to: { color: '#ff0000' },
        step: (state, bar) => {
          bar.path.setAttribute('stroke', state.color);
        }
      });
    }, 100)

  }
  startFabrication() {
    if (this.product.quantite >= 1) {
      const progress = (this.product.vitesse - this.product.timeleft) / this.product.vitesse;
      this.bar.animate(1, { duration: this.progress });
      this.product.timeleft = this.product.vitesse;
      this.lastupdate = Date.now();
      this.isRun = true;
      console.log('test2');
    }
  }

  calcScore() {
    if (this.isRun) {
      if (this.product.timeleft > (Date.now() - this.lastupdate)) {
        this.product.timeleft = this.product.timeleft - (Date.now() - this.lastupdate);
      } else {
        this.product.timeleft = 0;
        this.lastupdate = 0;
        this.isRun = false;
        this.bar.set(0);
      }
      this.notifyProduction.emit(this.product);
    }
  }

  achatProduct() {
    console.log(this.calcMaxCanBuy())
    if (this._qtmulti <= this.calcMaxCanBuy()) {
      let coutAchat = 0;
      for (let i = 0; i < this._qtmulti; i++) {
        this.maxAchat = this.maxAchat * this.product.croissance;
        coutAchat = coutAchat + this.maxAchat;
      }
      this.notifyMoney.emit(coutAchat);
      this.product.quantite = this.product.quantite + this._qtmulti;
      // bonus d'achat spécifique à chaque produit
      this.product.palliers.pallier.forEach(value => {
        if (!value.unlocked && this.product.quantite > value.seuil) {
          this.product.palliers.pallier[this.product.palliers.pallier.indexOf(value)].unlocked = true;
         // this.calcUpgrade(value);
         // this.notifyService.showSuccess("déblocage d'un bonus " + value.typeratio + " effectué pour " + this.product.name, "BONUS")
        }
      });
    }
  }

  calcMaxCanBuy(): number {
    let quantiteMax = 0;
    if (this.product.cout * this.product.croissance <= this._money) {
      const calPrelem = (this.product.cout - (this._money * (1 - this.product.croissance))) / this.product.cout;
      const quant = (Math.log(calPrelem)) / Math.log(this.product.croissance);
      quantiteMax = Math.floor(quant);
      if (isNaN(quantiteMax)) {
        quantiteMax = 0;
      }
    }
    return quantiteMax;
  }
}
