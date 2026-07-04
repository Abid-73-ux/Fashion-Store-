# Fashion Store Backend API

Node.js + Express API server for Fashion Store e-commerce platform.

## Setup

### Prerequisites
- Node.js v14+
- npm or yarn
- MongoDB Atlas account (free tier available)

### Installation

1. Install dependencies
```bash
npm install
```

2. Create `.env` file in backend folder:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fashionstore
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000,http://localhost:8000,https://fashionstore.vercel.app
```

3. Get MongoDB connection string:
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create free account
   - Create cluster
   - Get connection string
   - Replace `username:password` in `.env`

### Development

```bash
npm run dev
```

Server runs on `http://localhost:5000`

### Production

```bash
npm start
```

## Project Structure

```
backend/
├── config/          # Configuration files
├── database/        # Database connection
├── models/          # MongoDB models (User, Product, Order, etc.)
├── controllers/     # Business logic
├── routes/          # API endpoints
├── middleware/      # Authentication, validation, etc.
├── utils/           # Utility functions
├── .env             # Environment variables
└── index.js         # Server entry point
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin only)
- `PATCH /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Categories (Coming Soon)
- `GET /api/categories`
- `POST /api/categories` (admin only)
- `PATCH /api/categories/:id` (admin only)
- `DELETE /api/categories/:id` (admin only)

### Orders (Coming Soon)
- `GET /api/orders` (protected)
- `POST /api/orders` (protected)
- `GET /api/orders/:id` (protected)
- `PATCH /api/orders/:id` (admin only)

### Coupons (Coming Soon)
- `GET /api/coupons`
- `POST /api/coupons` (admin only)
- `PATCH /api/coupons/:id` (admin only)
- `DELETE /api/coupons/:id` (admin only)

### Users (Coming Soon)
- `GET /api/users` (admin only)
- `GET /api/users/:id` (protected)

## Authentication

Use JWT tokens in request headers:
```
Authorization: Bearer <token>
```

## Models

### User
- name, email, password, phone, address
- role (user/admin)
- image, createdAt, updatedAt

### Product
- name, description, price, category
- stock, image, images, sku
- rating, reviews, size, color, material
- brand, featured, active

### Category
- name, description, image
- slug, active, timestamps

### Order
- orderId, user, items (products)
- totalAmount, discountAmount, coupon
- shippingAddress, paymentMethod
- paymentStatus, orderStatus, timestamps

### Coupon
- code, description
- discountType (percentage/fixed), discountValue
- usageLimit, usageCount, usedBy
- expiryDate, active, timestamps

## Deployment

### Railway (Recommended - Free)
1. Push code to GitHub
2. Go to [Railway.app](https://railway.app)
3. Connect GitHub account
4. Select repository
5. Add MongoDB plugin
6. Deploy

### Heroku
1. Install Heroku CLI
2. `heroku login`
3. `heroku create fashionstore-api`
4. Add MongoDB Atlas URL as config variable
5. `git push heroku main`

### Render
1. Go to [render.com](https://render.com)
2. Create new Web Service
3. Connect GitHub
4. Configure environment variables
5. Deploy

## Development

### Adding New Endpoints

1. Create model in `models/`
2. Create controller in `controllers/`
3. Create route in `routes/`
4. Import route in `index.js`

Example:
```javascript
// routes/categories.js
router.get('/', getCategories);
router.post('/', protect, authorize('admin'), createCategory);

// index.js
app.use('/api/categories', require('./routes/categories'));
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| NODE_ENV | Environment | development |
| MONGODB_URI | Database URL | mongodb+srv://user:pass@cluster.mongodb.net/db |
| JWT_SECRET | JWT secret key | your_secret_key |
| JWT_EXPIRE | Token expiry | 7d |
| CORS_ORIGIN | CORS allowed origins | http://localhost:3000,https://example.com |

## Issues & Debugging

### MongoDB Connection Failed
- Check MONGODB_URI is correct
- Verify IP whitelist in MongoDB Atlas
- Ensure .env has correct credentials

### JWT Errors
- Token expired - user needs to login again
- Invalid token - check JWT_SECRET matches

### CORS Errors
- Add frontend URL to CORS_ORIGIN
- Check Origin header in request

## Future Features

- File uploads (multer integration)
- Payment gateway (Stripe, PayPal)
- Email notifications
- SMS notifications
- Advanced analytics
- Inventory management
- Review system

## Support

For issues, open GitHub issue or contact support.

---

**Last Updated**: July 2026
**API Version**: 1.0.0
