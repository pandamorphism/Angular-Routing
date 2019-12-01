import {Component, OnDestroy, OnInit} from '@angular/core';

import {MessageService} from '../../messages/message.service';

import {Product} from '../product';
import {ProductService} from '../product.service';
import {ActivatedRoute, Router} from '@angular/router';
import {map, pluck, switchMap, tap} from 'rxjs/operators';
import {untilDestroyed} from 'ngx-take-until-destroy';
import {Observable} from 'rxjs';

export const asNumber: (x: string) => number = x => +x;

@Component({
  templateUrl: './product-edit.component.html',
  styleUrls: ['./product-edit.component.css']
})
export class ProductEditComponent implements OnInit, OnDestroy {
  pageTitle = 'Product Edit';
  errorMessage: string;

  product: Product;

  constructor(private productService: ProductService,
              private messageService: MessageService,
              private route: ActivatedRoute,
              private router: Router) {
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      pluck('params', 'id'),
      map(asNumber),
      switchMap(this.getProduct.bind(this)),
      untilDestroyed(this)
    )
      .subscribe();
  }

  getProduct(id: number): Observable<Product> {
    return this.productService.getProduct(id).pipe(tap({
      next: product => this.onProductRetrieved(product),
      error: err => this.errorMessage = err
    }));
  }

  onProductRetrieved(product: Product): void {
    this.product = product;

    if (!this.product) {
      this.pageTitle = 'No product found';
    } else {
      if (this.product.id === 0) {
        this.pageTitle = 'Add Product';
      } else {
        this.pageTitle = `Edit Product: ${this.product.productName}`;
      }
    }
  }

  deleteProduct(): void {
    if (this.product.id === 0) {
      // Don't delete, it was never saved.
      this.onSaveComplete(`${this.product.productName} was deleted`);
    } else {
      if (confirm(`Really delete the product: ${this.product.productName}?`)) {
        this.productService.deleteProduct(this.product.id).subscribe({
          next: () => this.onSaveComplete(`${this.product.productName} was deleted`),
          error: err => this.errorMessage = err
        });
      }
    }
  }

  saveProduct(): void {
    if (true === true) {
      if (this.product.id === 0) {
        this.productService.createProduct(this.product).subscribe({
          next: () => this.onSaveComplete(`The new ${this.product.productName} was saved`),
          error: err => this.errorMessage = err
        });
      } else {
        this.productService.updateProduct(this.product).subscribe({
          next: () => this.onSaveComplete(`The updated ${this.product.productName} was saved`),
          error: err => this.errorMessage = err
        });
      }
    } else {
      this.errorMessage = 'Please correct the validation errors.';
    }
  }

  onSaveComplete(message?: string): void {
    if (message) {
      this.messageService.addMessage(message);
    }
    this.router.navigate(['/products']);
  }

  ngOnDestroy(): void {
  }
}
