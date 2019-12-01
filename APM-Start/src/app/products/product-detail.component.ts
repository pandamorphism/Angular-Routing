import {Component, OnDestroy, OnInit} from '@angular/core';

import {Product} from './product';
import {ProductService} from './product.service';
import {ActivatedRoute} from '@angular/router';
import {pluck, switchMap, tap} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {untilDestroyed} from 'ngx-take-until-destroy';

@Component({
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  pageTitle = 'Product Detail';
  product: Product;
  errorMessage: string;

  constructor(private productService: ProductService,
              private route: ActivatedRoute) {
  }

  getProduct(id: number): Observable<Product> {
    return this.productService.getProduct(id).pipe(
      tap({
        next: product => this.onProductRetrieved(product),
        error: err => this.errorMessage = err
      })
    );
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      pluck('params', 'id'),
      switchMap(this.getProduct.bind(this)),
      untilDestroyed(this),
    ).subscribe();
  }

  onProductRetrieved(product: Product): void {
    this.product = product;

    if (this.product) {
      this.pageTitle = `Product Detail: ${this.product.productName}`;
    } else {
      this.pageTitle = 'No product found';
    }
  }

  ngOnDestroy(): void {
  }
}
