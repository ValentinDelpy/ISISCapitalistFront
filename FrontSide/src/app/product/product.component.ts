import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {Pallier, Product} from '../world';
import {ThemePalette} from '@angular/material/core';
import {NotificationService} from "../notification.service";

declare var require;
const ProgressBar = require('progressbar.js');

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})


export class ProductComponent  {
  product: Product;
  color: ThemePalette = 'primary';
  progressbarvalue: number = 0;
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
      //this.progress = (this.product.vitesse - this.product.timeleft) / this.product.vitesse;
      this.progressbarvalue = this.product.vitesse;
      //this.bar.animate(1, { duration: this.progress });
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

  constructor(private notifyService : NotificationService) { }

  ngOnInit(): void {
    setInterval(() => {
      this.calcScore();
    }, 100);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      /*this.bar = new ProgressBar.Line(this.progressBarItem.nativeElement, {
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
      });*/
    }, 100)

  }
  startFabrication() {
    console.log(this.progressbarvalue);
    if (this.product.quantite>0){	    if (this.product.quantite>0){
      if (Number.isNaN(this.progressbarvalue) || this.progressbarvalue==0 ){
        this.product.timeleft = this.product.vitesse;	      this.product.timeleft = this.product.vitesse;
        this.lastupdate = Date.now();	      this.lastupdate = Date.now();
      }	    }
    }

  }

  calcScore() {
    //Lorsque l'on débloque le manager, le produit peut ne pas être en cours de fabrication
    //Il faut alors lancer la fabrication
    if (this.product.managerUnlocked && this.product.timeleft === 0) {
      this.startFabrication();
    }
    //Lorsque le produit n'est pas en fabrication, rien ne se passe
    else if (this.product.timeleft > 0) {
      let now = Date.now();
      let elapseTime = now - this.lastupdate;
      this.lastupdate = now;
      // On vérifie l'évolution du temps
      this.product.timeleft = this.product.timeleft - elapseTime;
      // Lorsque la fabrication est terminée, deux choses :
      if (this.product.timeleft <= 0) {
        this.product.timeleft = 0;
        this.lastupdate = 0;
        this.isRun = false;
        // On réinitialise la progressbar
        this.progressbarvalue = 0;
        // Envoie la notification de fabrication au composant parent.
        this.notifyProduction.emit(this.product);
        // La fabrication est automatiquement relancée par le manager.
        if (this.product.managerUnlocked) {
          this.product.timeleft = this.product.timeleft - (Date.now() - this.lastupdate);
          this.startFabrication();
        } else {
          this.progressbarvalue = ((this.product.vitesse - this.product.timeleft) / this.product.vitesse) * 100
          this.progressbarvalue = 0;
          // on prévient le composant parent que ce produit a été généré.
          this.notifyProduction.emit(this.product);
          // et on relance si jamais le manager est débloqué
          if (this.product.managerUnlocked) {
            this.startFabrication();
          }
        }
        // on calcule le positionnement de la barre de progression en pourcentage
      }
    }

  }
    achatProduct(){
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
        //this.product.palliers.pallier.forEach(value => {
        //if (!value.unlocked && this.product.quantite > value.seuil) {
        //this.product.palliers.pallier[this.product.palliers.pallier.indexOf(value)].unlocked = true;
        // this.calcUpgrade(value);
        // this.notifyService.showSuccess("déblocage d'un bonus " + value.typeratio + " effectué pour " + this.product.name, "BONUS")
        //}
        // });

      }
    }


  calcMaxCanBuy(): number {
    let quantiteMax = 0;
    if (this.product.cout * this.product.croissance <= this._money) {
      const calPrelem = (this.product.cout - (this._money * (1 - this.product.croissance))) / this.product.cout;
      const quant = (Math.log(calPrelem)) / Math.log(this.product.croissance);
      quantiteMax = Math.floor(quant);
      if (isNaN(quantiteMax) || quantiteMax < 0) {
        quantiteMax = 0;
      }
    }
    return quantiteMax;
  }

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
