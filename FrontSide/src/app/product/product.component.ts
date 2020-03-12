import {Component, Input, OnInit} from '@angular/core';
import {Product} from '../world';
import {ThemePalette} from '@angular/material/core';
import {ProgressBarMode} from '@angular/material/progress-bar';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})

export class ProductComponent implements OnInit {
  product: Product;
  color: ThemePalette = 'primary';
  mode: ProgressBarMode = 'determinate';
  value = 50;
  bufferValue = 75;

  constructor() { }

  ngOnInit(): void {
  }

  @Input()
  set prod(value: Product) {
    this.product = value;
  }
}
