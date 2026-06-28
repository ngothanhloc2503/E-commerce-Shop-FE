# E-Commerce Platform (Angular)

Một nền tảng thương mại điện tử hiện đại được xây dựng bằng Angular, hỗ trợ đa vai trò (Admin, Staff, Customer) với kiến trúc modular và các best practices mới nhất của Angular.

## 📋 Mục lục

- [Tính năng chính](#-tính-năng-chính)
- [Kiến trúc dự án](#-kiến-trúc-dự-án)
- [Yêu cầu hệ thống](#-yêu-cầu-hệ-thống)
- [Cài đặt & Chạy dự án](#-cài-đặt--chạy-dự-án)
- [Biến môi trường](#-biến-môi-trường)
- [Docker Support](#-docker-support)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [Best Practices](#-best-practices)
- [Troubleshooting](#-troubleshooting)
- [Đóng góp](#-đóng-góp)
- [License](#-license)

## ✨ Tính năng chính

### 🔐 Authentication & Authorization
- **Multi-role support**: Admin, Staff, Customer
- **JWT-based authentication** với auto token refresh
- **Role-based access control (RBAC)**
- **Persistent session** với secure storage
- **Auto logout** khi token hết hạn

### 👥 Quản lý Người dùng
- **Admin Dashboard**: Thống kê, quản lý toàn hệ thống
- **Staff Portal**: Quản lý sản phẩm, đơn hàng, danh mục
- **Customer Portal**: Mua sắm, theo dõi đơn hàng, profile

### 🛍️ E-Commerce Features
- **Product Management**: CRUD, variants, inventory tracking
- **Category Management**: Phân cấp danh mục
- **Order Management**: Xử lý đơn hàng, trạng thái, vận chuyển
- **Shopping Cart**: Giỏ hàng thông minh
- **Payment Integration**: Hỗ trợ nhiều cổng thanh toán
- **Review & Rating**: Đánh giá sản phẩm

### ⚙️ Settings & Configuration
- **System Settings**: Cấu hình toàn hệ thống
- **User Preferences**: Tùy chỉnh cá nhân
- **TinyMCE Integration**: Soạn thảo văn bản rich-text

## 🏗️ Kiến trúc dự án

```
├── src/
│   ├── app/
│   │   ├── core/          # Core module (singleton services, guards, interceptors)
│   │   ├── features/      # Feature modules (lazy-loaded)
│   │   ├── shared/        # Shared components, directives, pipes
│   │   └── app.routes.ts  # Main routing configuration
│   ├── assets/            # Static assets (images, fonts, i18n)
│   ├── environments/      # Environment configurations
│   └── styles/            # Global styles, Tailwind config
```

### Core Layers
- **Core Module**: Auth service, HTTP interceptors, Guards, App initialization
- **Feature Modules**: Domain-specific functionality (Admin, Staff, Customer)
- **Shared Module**: Reusable components, directives, pipes, utilities

### State Management
- **Angular Signals**: Modern reactive state management
- **Computed Signals**: Derived state với automatic caching
- **Effect-based side effects**: Clean separation of concerns

## 💻 Yêu cầu hệ thống

- **Node.js**: >= 18.13.0
- **npm**: >= 8.19.0
- **Angular CLI**: >= 17.0.0
- **Docker** (optional): >= 20.10.0
- **Docker Compose** (optional): >= 2.0.0

## 🚀 Cài đặt & Chạy dự án

### 1. Clone repository
```bash
git clone <repository-url>
cd e-commerce-angular
```

### 2. Cài đặt dependencies
```bash
npm install
```

### 3. Cấu hình biến môi trường
```bash
cp src/environments/environment.example.ts src/environments/environment.ts
# Chỉnh sửa các biến trong environment.ts
```

### 4. Chạy development server
```bash
npm start
# hoặc
ng serve
```

Truy cập `http://localhost:4200`

### 5. Build production
```bash
npm run build
# hoặc
ng build --configuration production
```

Build output sẽ nằm trong thư mục `dist/`

### 6. Chạy tests
```bash
# Unit tests
npm run test

# E2E tests
npm run e2e

# Test với coverage
npm run test:coverage
```

### 7. Linting & Formatting
```bash
# Lint code
npm run lint

# Format code với Prettier
npm run format

# Check format
npm run format:check
```

## 🔧 Biến môi trường

| Variable | Description | Default |
|----------|-------------|---------|
| `API_URL` | Backend API endpoint | `http://localhost:3000` |
| `APP_NAME` | Application name | `E-Commerce` |
| `AUTH_TOKEN_KEY` | LocalStorage key for auth token | `auth_token` |
| `REFRESH_TOKEN_KEY` | LocalStorage key for refresh token | `refresh_token` |
| `TOKEN_EXPIRY_BUFFER` | Buffer time before token expiry (ms) | `300000` |
| `MAX_RETRY_ATTEMPTS` | Maximum HTTP retry attempts | `3` |
| `ENABLE_DEBUG` | Enable debug mode | `false` |

Ví dụ file `environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  appName: 'E-Commerce Dev',
  authTokenKey: 'auth_token',
  refreshTokenKey: 'refresh_token',
  tokenExpiryBuffer: 300000,
  maxRetryAttempts: 3,
  enableDebug: true
};
```

## 🐳 Docker Support

### Chạy với Docker Compose
```bash
# Build và chạy tất cả services
docker-compose up -d

# Xem logs
docker-compose logs -f

# Dừng services
docker-compose down
```

### Build Docker image
```bash
docker build -t e-commerce-angular .
```

### Chạy container
```bash
docker run -p 4200:80 e-commerce-angular
```

## 🧪 Testing

### Unit Tests
```bash
npm run test
npm run test:watch  # Watch mode
npm run test:ci     # CI mode
```

### E2E Tests
```bash
npm run e2e
npm run e2e:headless  # Headless mode
```

### Test Coverage
```bash
npm run test:coverage
# Report sẽ nằm trong coverage/
```

### Environment-specific Builds
```bash
# Development
ng build --configuration development

# Staging
ng build --configuration staging

# Production
ng build --configuration production
```

## 📁 Cấu trúc thư mục

```
e-commerce-angular/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── guards/           # Route guards (auth, role-based)
│   │   │   ├── interceptors/     # HTTP interceptors (auth, error, retry)
│   │   │   ├── services/         # Core services (auth, settings, user)
│   │   │   └── core.module.ts
│   │   ├── features/
│   │   │   ├── admin/            # Admin dashboard & features
│   │   │   ├── staff/            # Staff portal
│   │   │   ├── customer/         # Customer portal
│   │   │   └── auth/             # Authentication pages
│   │   ├── shared/
│   │   │   ├── components/       # Reusable UI components
│   │   │   ├── directives/       # Custom directives
│   │   │   ├── pipes/            # Custom pipes
│   │   │   ├── models/           # TypeScript interfaces/models
│   │   │   └── utils/            # Utility functions
│   │   ├── app.component.ts
│   │   ├── app.routes.ts
│   │   └── app.config.ts
│   ├── assets/
│   │   ├── images/
│   │   ├── fonts/
│   │   └── i18n/                 # Internationalization files
│   ├── environments/
│   │   ├── environment.ts
│   │   ├── environment.prod.ts
│   │   └── environment.staging.ts
│   ├── styles/
│   │   ├── _variables.scss
│   │   ├── _mixins.scss
│   │   └── styles.scss
│   ├── index.html
│   └── main.ts
├── public/
├── docker/
│   ├── Dockerfile
│   └── nginx.conf
├── .github/
│   └── workflows/                # GitHub Actions
├── scripts/
│   └── deploy.sh
├── .env.example
├── .eslintrc.json
├── .prettierrc
├── angular.json
├── docker-compose.yml
├── Jenkinsfile
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## 🎯 Best Practices

### Code Quality
- ✅ **TypeScript Strict Mode**: Enable strict type checking
- ✅ **ESLint + Prettier**: Consistent code style
- ✅ **Pre-commit Hooks**: Auto-formatting và linting
- ✅ **Component Documentation**: JSDoc comments
- ✅ **Meaningful Naming**: Clear variable/function names

### Performance
- ✅ **Lazy Loading**: Load features on demand
- ✅ **OnPush Change Detection**: Optimize rendering
- ✅ **Image Optimization**: Lazy loading, WebP format
- ✅ **Bundle Optimization**: Tree-shaking, code splitting
- ✅ **HTTP Caching**: Reduce API calls

### Security
- ✅ **Token Refresh**: Automatic JWT refresh
- ✅ **XSS Protection**: Sanitize user inputs
- ✅ **CSRF Tokens**: Protect against CSRF attacks
- ✅ **Secure Storage**: Encrypted sensitive data
- ✅ **Input Validation**: Client & server-side validation

## 🔧 Troubleshooting

### Common Issues

#### 1. Build fails with "Module not found"
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 2. Port 4200 already in use
```bash
# Kill process on port 4200
lsof -ti:4200 | xargs kill -9

# Or use different port
ng serve --port 4201
```

#### 3. Docker build fails
```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

#### 4. Tests failing randomly
```bash
# Run tests in band
npm run test -- --browsers=ChromeHeadless --watch=false
```

#### 5. API CORS errors
- Ensure backend allows your frontend origin
- Check `environment.ts` API URL configuration
- Verify proxy configuration in `proxy.conf.json`

### Debug Mode
Enable debug mode để xem detailed logs:
```typescript
// environment.ts
export const environment = {
  enableDebug: true,
  // ...
};
```

### Coding Standards
- Follow Angular Style Guide
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before PR

### Reporting Issues
- Use GitHub Issues template
- Provide clear reproduction steps
- Include environment details
- Attach screenshots if applicable

## 👤 Author

**Ngo Thanh Loc**
*Java Back End Developer*
📧 ngoloc2706@gmail.com
🔗 [GitHub](https://github.com/ngothanhloc2503)
🔗 [GitLab](https://gitlab.com/ntloc2503)
🔗 [LinkedIn](www.linkedin.com/in/thanh-loc-ngo-0749692b5)

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.