import { Injectable } from '@nestjs/common';

type Product = { id: number; name: string; category: string; price: number; stock: number; specs: Record<string, string>; images: string[]; skus: Array<{ code: string; price: number; stock: number }>; sales: number; avgRating: number; reviewCount: number };

@Injectable()
export class ProductService {
  private products: Product[] = [{ id: 1, name: '陶艺入门泥料包', category: 'pottery', price: 68, stock: 80, specs: { weight: '2kg' }, images: ['/uploads/clay.jpg'], skus: [{ code: 'CLAY-2KG', price: 68, stock: 80 }], sales: 15, avgRating: 0, reviewCount: 0 }];

  create(payload: Omit<Product, 'id' | 'sales' | 'avgRating' | 'reviewCount'>) {
    const product = { ...payload, id: Date.now(), sales: 0, avgRating: 0, reviewCount: 0 };
    this.products.push(product);
    return product;
  }

  findById(id: number) {
    return this.products.find((item) => item.id === id) || null;
  }

  list(query: { category?: string; keyword?: string }) {
    return this.products.filter((item) => (!query.category || item.category === query.category) && (!query.keyword || item.name.includes(query.keyword)));
  }

  bestSellers() { return [...this.products].sort((a, b) => b.sales - a.sales); }

  addReview(id: number, rating: number) {
    const product = this.products.find((item) => item.id === id);
    if (!product) return null;
    const totalRating = product.avgRating * product.reviewCount + rating;
    product.reviewCount += 1;
    product.avgRating = Number((totalRating / product.reviewCount).toFixed(1));
    return product;
  }
}
