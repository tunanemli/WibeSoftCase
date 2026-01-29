# WibeSoft E-Commerce API

WibeSoft BackEnd Developer Case

## Özellikler

### Zorunlu Özellikler
- Ürün yönetimi (CRUD)
  - Ürün listesinin getirilmesi
  - Tekil ürün detayının getirilmesi
  - Ürün modeli: İsim, Açıklama, Fiyat, Görsel URL, Stok bilgisi
- Sepet yönetimi
  - Sepete ürün ekleme
  - Sepetten ürün çıkarma
  - Sepetteki ürünlerin listelenmesi
  - Ürün adedinin güncellenmesi
  - Sepet yapısı session mantığıyla kurgulanmıştır
- Swagger API dokümantasyonu

### Opsiyonel / Bonus Özellikler
- **Kimlik Doğrulama (JWT)** Bonus
  - Basit kullanıcı modeli
  - JWT tabanlı authentication
  - Korumalı endpoint örnekleri
- **Sipariş Yönetimi** Bonus
  - Sepetin siparişe dönüştürülmesi
  - Sipariş toplam tutarının hesaplanmasi
  - Sipariş durumu yönetimi

### Ek Özellikler
- Rate limiting
- Unit testler
- Docker desteği

## Gereksinimler

- Node.js 20+
- npm veya yarn
- PostgreSQL 12+ (Manuel kurulum için)
- Docker & Docker Compose (Opsiyonel - Docker ile çalıştırma için)

## Manuel Kurulum

Docker kullanmadan manuel olarak kurulum yapmak için aşağıdaki adımları izleyin:

### 1. PostgreSQL Kurulumu ve Veritabanı Oluşturma

PostgreSQL'in kurulu olduğundan emin olun ve veritabanını oluşturun:

```bash
psql -U postgres

CREATE DATABASE wibesoft_ecommerce;

\q
```

### 2. Projeyi Klonlayın ve Bağımlılıkları Yükleyin

```bash
cd wibeSoftCase

npm install
```

### 3. Ortam Değişkenlerini Ayarlayın

Proje kök dizininde `.env` dosyası oluşturun:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=wibesoft_ecommerce
DB_SYNCHRONIZE=true
JWT_SECRET=wibesoftcaseproject
JWT_EXPIRES_IN=24h
PORT=3000
```

Not: `.env.example` dosyası proje kök dizininde mevcuttur. Bu dosyayı `.env` olarak kopyalayıp gerekli değerleri ayarlayabilirsiniz.

### 4. Uygulamayı Çalıştırın

#### Development Modu

```bash
npm run start:dev
```

#### Production Modu

```bash
npm run build

npm run start:prod
```

### 5. Testleri Çalıştırın

```bash
npm test

npm run test:cov

npm run test:watch
```

### 6. Swagger Dokümantasyonuna Erişin

Uygulama çalıştıktan sonra Swagger dokümantasyonuna şu adresten erişebilirsiniz:

```
http://localhost:3000/api/docs
```

## Docker ile Çalıştırma

### Development Modu

```bash
docker-compose -f docker-compose.dev.yml up --build
```

Bu komut:
- PostgreSQL veritabanını başlatır
- Development modunda uygulamayı çalıştırır
- Port 3000'de API'yi erişilebilir hale getirir
- pgAdmin'i port 5050'de başlatır

### Production Modu

```bash
docker-compose up --build
```

Bu komut:
- PostgreSQL veritabanını başlatır
- Production modunda uygulamayı çalıştırır
- Port 3000'de API'yi erişilebilir hale getirir
- pgAdmin'i port 5050'de başlatır

## Docker Komutları

### Servisleri Başlatma

**Production:**
```bash
docker-compose up -d
```

**Development:**
```bash
docker-compose -f docker-compose.dev.yml up -d
```

### Servisleri Durdurma

**Production:**
```bash
docker-compose down
```

**Development:**
```bash
docker-compose -f docker-compose.dev.yml down
```

### Logları Görüntüleme

**Production:**
```bash
docker-compose logs -f app
```

**Development:**
```bash
docker-compose -f docker-compose.dev.yml logs -f app
```

### Veritabanı Logları

**Production:**
```bash
docker-compose logs -f postgres
```

**Development:**
```bash
docker-compose -f docker-compose.dev.yml logs -f postgres
```

### Container'ları Yeniden Build Etme

**Production:**
```bash
docker-compose build --no-cache
```

**Development:**
```bash
docker-compose -f docker-compose.dev.yml build --no-cache
```

### Veritabanı Verilerini Temizleme

**Production:**
```bash
docker-compose down -v
```

**Development:**
```bash
docker-compose -f docker-compose.dev.yml down -v
```

### pgAdmin Erişimi

Docker Compose dosyalarında pgAdmin servisi de dahil edilmiştir. pgAdmin'e şu adresten erişebilirsiniz:

- **URL:** http://localhost:5050
- **Email:** admin@wibesoft.com
- **Password:** admin

## API Endpoints

### Swagger Dokümantasyonu

Uygulama çalıştıktan sonra Swagger dokümantasyonuna şu adresten erişebilirsiniz:

```
http://localhost:3000/api/docs
```

### Ana Endpoint'ler

#### Ürünler (Zorunlu)
- `GET /api/products/listProducts` - Ürün listesi (pagination)
- `GET /api/products/getProduct/:id` - ID ile ürün getir
- `POST /api/products/createProduct` - Ürün oluştur (Test kolaylığı amacıyla eklendi)
- `PATCH /api/products/updateProduct/:id` - Ürün güncelle (Test kolaylığı amacıyla eklendi)

#### Sepet (Zorunlu)
- `POST /api/cart/addItemToCart` - Sepete ürün ekle
- `GET /api/cart/getCart` - Sepet içeriği
- `PATCH /api/cart/updateCartItem/:id` - Sepet öğesi güncelle
- `DELETE /api/cart/removeItemFromCart/:id` - Sepetten ürün çıkar
- `DELETE /api/cart/clearCart` - Sepeti temizle

#### Authentication Bonus / Opsiyonel
- `POST /api/auth/registerUser` - Kullanıcı kaydı
- `POST /api/auth/loginUser` - Kullanıcı girişi
- `GET /api/auth/getProfile` - Profil bilgisi (JWT korumalı)

#### Siparişler Bonus / Opsiyonel
- `POST /api/orders/createOrder` - Sepetin siparişe dönüştürülmesi
- `GET /api/orders/listOrders` - Sipariş listesi
- `GET /api/orders/getOrder/:id` - ID ile sipariş getir
- `PATCH /api/orders/updateOrderStatus/:id` - Sipariş durumu güncelle

## Ortam Değişkenleri

Docker Compose dosyalarında aşağıdaki ortam değişkenleri tanımlıdır:

```env
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=wibesoft_ecommerce
DB_SYNCHRONIZE=true
JWT_SECRET=wibesoftcaseproject
JWT_EXPIRES_IN=24h
PORT=3000
NODE_ENV=production (veya development)
```

Production ortamında bu değerleri `.env` dosyası ile override edebilirsiniz.

## Veritabanı

### Manuel Kurulum ile Veritabanı

PostgreSQL'in kurulu olduğundan ve çalıştığından emin olun. Veritabanına bağlanmak için:

```bash
psql -U postgres -d wibesoft_ecommerce
```

### Docker ile Veritabanı

PostgreSQL veritabanı Docker container'ı olarak çalışır. Veriler volume'lerde saklanır:
- Production: `postgres_data`
- Development: `postgres_data_dev`

#### Veritabanına Bağlanma

**Production:**
```bash
docker exec -it wibeSoft-ecommerce-postgres psql -U postgres -d wibesoft_ecommerce
```

**Development:**
```bash
docker exec -it wibeSoft-ecommerce-postgres-dev psql -U postgres -d wibesoft_ecommerce
```

## Testler

### Manuel Kurulum ile Testler

```bash
npm test

npm run test:cov

npm run test:watch
```

### Docker ile Testler

**Production:**
```bash
docker-compose exec app npm test

docker-compose exec app npm run test:cov
```

**Development:**
```bash
docker-compose -f docker-compose.dev.yml exec app npm test

docker-compose -f docker-compose.dev.yml exec app npm run test:cov
```

## Sorun Giderme

### Port Zaten Kullanılıyor

Eğer 3000 veya 5432 portları kullanılıyorsa, `docker-compose.yml` dosyasındaki port mapping'leri değiştirin.

### Veritabanı Bağlantı Hatası

Container'ların aynı network'te olduğundan emin olun. `docker-compose ps` komutu ile kontrol edin.

### Build Hatası

```bash
docker-compose build --no-cache
```
