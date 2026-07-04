# Fashion Store E-Commerce Platform

A modern, fully-featured e-commerce platform built with HTML5, CSS3, and vanilla JavaScript.

## Features

### Customer Features
- 🛍️ Product catalog with search and filtering
- 🛒 Shopping cart functionality
- 💳 Checkout process
- 👤 User authentication and profiles
- 📦 Order tracking
- ⭐ Product reviews and ratings
- ❤️ Wishlist management
- 🎟️ Coupon/discount application

### Admin Dashboard
- 📊 Analytics and statistics
- 📦 Product management (CRUD)
- 🏷️ Category management
- 👥 Customer management
- 📋 Order management
- 🎟️ Coupon management
- ⭐ Review management
- 📈 Inventory tracking

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Storage**: localStorage (client-side data persistence)
- **Styling**: Bootstrap 5, Custom CSS
- **Icons**: Bootstrap Icons
- **Fonts**: Google Fonts (Montserrat, Cormorant Garamond, Cinzel)

## Project Structure

```
├── frontend/
│   ├── admin/              # Admin dashboard pages
│   │   ├── categories/     # Category management forms
│   │   ├── coupons/        # Coupon management forms
│   │   ├── products/       # Product management forms
│   │   └── *.html          # Admin pages
│   ├── assets/
│   │   ├── css/            # Stylesheets
│   │   └── js/             # JavaScript modules
│   └── *.html              # Customer-facing pages
├── backend/                # Backend API (future implementation)
└── docs/                   # Documentation
```

## Getting Started

### Local Development

1. Clone the repository
```bash
git clone https://github.com/yourusername/fashion-store.git
cd fashion-store
```

2. Open in browser
```bash
# Simply open any HTML file in your browser
# Or use a local server like:
python -m http.server 8000
# Then navigate to http://localhost:8000
```

3. Admin Access
   - Navigate to `/frontend/admin/login.html`
   - Default credentials: Email: `admin@example.com`, Password: `admin123`

## Features Details

### Admin Dashboard Features
- **Dashboard**: Real-time statistics and recent orders
- **Products**: Full CRUD operations with image uploads
- **Categories**: Organize products by category with images
- **Orders**: Track and manage customer orders
- **Customers**: View customer information and purchase history
- **Coupons**: Create and manage promotional codes
- **Inventory**: Monitor stock levels
- **Analytics**: View sales trends and metrics

### Data Persistence
All admin data is stored in browser's localStorage:
- `admin_products` - Product inventory
- `admin_categories` - Product categories
- `admin_orders` - Customer orders
- `admin_coupons` - Promotional codes
- `admin_customers` - Customer information
- `admin_reviews` - Product reviews

## Deployment

### GoDaddy Hosting
See `GODADDY_DEPLOYMENT_GUIDE.md` for detailed deployment instructions.

### Quick Deploy Steps
1. Get FTP credentials from hosting provider
2. Use FileZilla to upload `frontend` folder contents
3. Upload database/API files to backend folder
4. Configure DNS settings
5. Enable SSL certificate

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (responsive design)

## Future Enhancements

- Backend API integration (Node.js/Express, Python/Django, etc.)
- Database integration (MongoDB, PostgreSQL, MySQL)
- Payment gateway integration (Stripe, PayPal)
- Email notifications
- SMS notifications
- Advanced analytics
- Social media integration
- Inventory sync with warehouse system

## License

MIT License - feel free to use this project for your own purposes.

## Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

**Last Updated**: July 2026
**Version**: 1.0.0
