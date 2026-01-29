import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
  statusCode: number;
  message?: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const method = request.method;
    const url = request.url;
    const statusCode = response.statusCode;

    const getMessage = (): string | undefined => {
      if (statusCode >= 400) {
        return undefined;
      }

      if (method === 'POST') {
        if (url.includes('/auth/registerUser')) {
          return 'Kullanıcı başarıyla kaydedildi';
        }
        if (url.includes('/auth/loginUser')) {
          return 'Giriş başarılı';
        }
        if (url.includes('/products/createProduct')) {
          return 'Ürün başarıyla oluşturuldu';
        }
        if (url.includes('/cart/addItemToCart')) {
          return 'Ürün sepete başarıyla eklendi';
        }
        if (url.includes('/orders/createOrder')) {
          return 'Sipariş başarıyla oluşturuldu';
        }
        return 'Başarıyla oluşturuldu';
      }

      if (method === 'PATCH' || method === 'PUT') {
        if (url.includes('/products/updateProduct')) {
          return 'Ürün başarıyla güncellendi';
        }
        if (url.includes('/cart/updateCartItem')) {
          return 'Sepet öğesi başarıyla güncellendi';
        }
        if (url.includes('/orders/updateOrderStatus')) {
          return 'Sipariş durumu başarıyla güncellendi';
        }
        return 'Başarıyla güncellendi';
      }

      if (method === 'GET') {
        if (url.includes('/products/listProducts')) {
          return 'Ürünler başarıyla getirildi';
        }
        if (url.includes('/products/getProduct')) {
          return 'Ürün başarıyla getirildi';
        }
        if (url.includes('/cart/getCart')) {
          return 'Sepet başarıyla getirildi';
        }
        if (url.includes('/orders/listOrders')) {
          return 'Siparişler başarıyla getirildi';
        }
        if (url.includes('/orders/getOrder')) {
          return 'Sipariş başarıyla getirildi';
        }
        if (url.includes('/auth/getProfile')) {
          return 'Profil başarıyla getirildi';
        }
        return 'Başarıyla getirildi';
      }

      return undefined;
    };

    return next.handle().pipe(
      map((data) => {
        if (statusCode === 204) {
          return data;
        }

        if (data && typeof data === 'object' && 'message' in data) {
          return data;
        }

        return {
          data,
          statusCode,
          message: getMessage(),
        };
      }),
    );
  }
}
