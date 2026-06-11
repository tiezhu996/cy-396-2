import { Injectable } from '@nestjs/common';
import { OrderService } from '../order/order.service';
import { ProductService } from '../product/product.service';
import { ERROR_CODES } from '../../constants/error-codes';
import { AppException } from '../../common/errors/app.exception';

type ProductReview = { id: number; productId: number; userId: number; orderId: number; rating: number; comment: string; images: string[] };
type TutorialReview = { id: number; tutorialId: number; userId: number; rating: number; comment: string };

@Injectable()
export class ReviewService {
  private tutorialReviews: TutorialReview[] = [];
  private productReviews: ProductReview[] = [];

  constructor(
    private readonly orderService: OrderService,
    private readonly productService: ProductService,
  ) {}

  reviewTutorial(tutorialId: number, payload: { userId: number; rating: number; comment: string }) {
    const review = { id: Date.now(), tutorialId, ...payload };
    this.tutorialReviews.push(review);
    return review;
  }

  reviewProduct(
    productId: number,
    payload: { userId: number; rating: number; comment: string; images: string[] },
  ) {
    const order = this.orderService.findCompletedOrderByProduct(payload.userId, productId);
    if (!order) {
      throw new AppException(ERROR_CODES.PRODUCT_NOT_PURCHASED, '只能评价已购买且已完成的商品');
    }

    const alreadyReviewed = this.productReviews.some(
      (r) => r.orderId === order.id && r.productId === productId,
    );
    if (alreadyReviewed) {
      throw new AppException(ERROR_CODES.ORDER_ALREADY_REVIEWED, '该商品已评价，请勿重复评价');
    }

    const product = this.productService.findById(productId);
    if (!product) {
      throw new AppException(ERROR_CODES.NOT_FOUND, '商品不存在');
    }

    const review: ProductReview = {
      id: Date.now(),
      productId,
      userId: payload.userId,
      orderId: order.id,
      rating: payload.rating,
      comment: payload.comment,
      images: payload.images || [],
    };
    this.productReviews.push(review);

    this.orderService.markAsReviewed(order.id);
    this.productService.addReview(productId, payload.rating);

    return review;
  }

  stats() {
    return { tutorialReviewCount: this.tutorialReviews.length, productReviewCount: this.productReviews.length };
  }
}
