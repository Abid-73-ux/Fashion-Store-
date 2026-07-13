# Filter System Usage Guide

## Overview

The eCommerce platform now has a fully functional filtering system with size, color, and price range filters.

## Available Filters

### 1. Size Filter
- **Options**: XS, S, M, L, XL, XXL
- **How it works**: Select one or more sizes, click "Apply Filters"
- **Result**: Shows all products that have your selected size(s)

### 2. Color Filter
- **Options**: Black, White, Red, Blue, Green, Gray
- **How it works**: Click on color swatches, click "Apply Filters"
- **Result**: Shows all products available in your selected color(s)

### 3. Price Range Filter
- **How it works**: Enter minimum and/or maximum price, click "Apply Filters"
- **Example**: Min=500, Max=1500 will show products priced between PKR 500-1500
- **Result**: Shows all products within your price range

### 4. Sort Options
- Sort by Latest (default)
- Sort by Price: Low to High
- Sort by Price: High to Low
- Sort by Name: A-Z
- Sort by Name: Z-A
- Sort by Rating

## How to Use

### Web Interface (http://127.0.0.1:5500/frontend/shop.html)

#### Step 1: Apply Filters
1. Open the Shop page
2. In the left sidebar, select your desired filters:
   - Check size checkboxes
   - Click color swatches
   - Enter price range
3. Click the blue "Apply Filters" button

#### Step 2: View Results
- Products matching your filters appear in the grid
- The product count updates to show results
- Products are paginated (12 per page by default)

#### Step 3: Clear Filters
- Click "Clear All" button to reset all filters
- Or uncheck individual selections and click "Apply Filters" again

### API Interface (Developers)

#### Basic API Endpoint
```
GET http://127.0.0.1:5000/api/products
```

#### Query Parameters

| Parameter | Type | Example | Description |
|-----------|------|---------|-------------|
| size | string | ?size=M | Filter by size |
| color | string | ?color=black | Filter by color |
| minPrice | number | ?minPrice=500 | Minimum price |
| maxPrice | number | ?maxPrice=1500 | Maximum price |
| category | string | ?category=men | Filter by category |
| sortBy | string | ?sortBy=price_asc | Sort order |
| page | number | ?page=1 | Page number |
| limit | number | ?limit=12 | Items per page |

#### API Examples

```bash
# Get all products
curl "http://127.0.0.1:5000/api/products?limit=12&page=1"

# Filter by size M
curl "http://127.0.0.1:5000/api/products?size=M"

# Filter by color black
curl "http://127.0.0.1:5000/api/products?color=black"

# Filter by size M AND color black
curl "http://127.0.0.1:5000/api/products?size=M&color=black"

# Filter by price range
curl "http://127.0.0.1:5000/api/products?minPrice=500&maxPrice=1500"

# Multiple sizes (OR logic)
curl "http://127.0.0.1:5000/api/products?size=M&size=L&size=XL"

# Combined filters with sort
curl "http://127.0.0.1:5000/api/products?size=M&color=black&minPrice=1000&maxPrice=2000&sortBy=price_asc"
```

## Technical Details

### Database Storage Format

Products store multiple values as comma-separated strings:

```
Product: Premium Cotton T-Shirt
- size: "M,L,XL"
- color: "Black,White,Blue"
- price: 1299
```

### Filter Logic

- **Size & Color**: Uses LIKE operator for substring matching (case-insensitive)
- **Multiple selections**: Combined with OR logic (M OR L means sizes M or L)
- **Price**: Uses numeric comparison (>= and <=)
- **Combining different filters**: Uses AND logic (size M AND color black)

### Performance

- Frontend caching: 5 minutes per query
- Pagination: 12 products per page
- Sorting: Applied after filtering
- No limit on result count in API

## Troubleshooting

### Filters Not Working
1. Check browser console (F12 → Console)
2. Verify backend is running: `http://127.0.0.1:5000/api/health`
3. Check network requests in DevTools

### No Products Showing
1. Verify filter values match database
2. Try "Clear All" and search again
3. Check that at least one product matches your filters

### Wrong Results
1. Each filter value must exist in the database
2. Size and color are comma-separated in DB
3. Check console logs for filter values being sent

## Test Data Available

8 test products are loaded in the database:

1. **Premium Cotton T-Shirt** (M,L,XL | Black,White,Blue | PKR 1299)
2. **Classic Denim Jeans** (S,M,L,XL | Blue,Black | PKR 2499)
3. **Elegant Silk Dress** (S,M,L | Red,Black,Navy | PKR 2999)
4. **Summer Floral Blouse** (S,M,L,XL | Yellow,Pink,White | PKR 1099)
5. **Wool Winter Sweater** (M,L,XL,XXL | Gray,Navy,Cream | PKR 1899)
6. **Casual Chinos** (S,M,L,XL | Beige,Gray,Blue | PKR 1299)
7. **Designer Polo Shirt** (S,M,L,XL,XXL | Red,White,Blue | PKR 899)
8. **Linen Summer Shorts** (XS,S,M,L,XL | White,Khaki,Navy | PKR 799)

## API Response Format

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Premium Cotton T-Shirt",
      "price": 1299,
      "salePrice": null,
      "size": "M,L,XL",
      "color": "Black,White,Blue",
      "category": "men",
      "stock": 50,
      "image": "...",
      "rating": 4.5
    }
  ],
  "pagination": {
    "total": 3,
    "page": 1,
    "limit": 12,
    "pages": 1
  }
}
```

## Future Enhancements

- [ ] Real-time filtering (no Apply button needed)
- [ ] Filter history/saved filters
- [ ] Advanced filters (material, brand, etc.)
- [ ] Filter count badges
- [ ] Filter analytics
