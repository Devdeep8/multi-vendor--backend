# Admin API Documentation

This document provides information about the Admin API endpoints for the BAB eCommerce platform.

## Base URL

All API endpoints are relative to: `http://localhost:5000/admin/`

## Authentication

Admin API endpoints should be protected with authentication middleware. Currently, the endpoints are open for development purposes.

## Endpoints

### Dashboard Data

```
GET /dashboard
```

Returns overview metrics for the admin dashboard including:
- Total revenue
- Revenue change percentage
- Total users
- Users change percentage
- Total orders
- Orders change percentage
- Total products
- Products change percentage

### Users

```
GET /users
```

Returns a list of users with basic information:
- User ID
- Name
- Email
- Role
- Created date
- Last updated date

### Products

```
GET /products
```

Returns a list of products with:
- Product ID
- Name
- Category
- Price
- Stock
- Seller information
- Created date

### Orders

```
GET /orders
```

Returns a list of orders with:
- Order ID
- Customer information
- Order items
- Total amount
- Status
- Created date

### Top Sellers

```
GET /sellers
```

Returns a list of top-performing sellers based on revenue:
- Seller ID
- Name
- Store name
- Revenue
- Number of sales
- Trend (up/down/neutral)

### Latest Activities

```
GET /activities
```

Returns a list of recent activities on the platform:
- Activity ID
- User information
- Action performed
- Target of the action
- Activity type
- Timestamp

### Revenue Data

```
GET /revenue
```

Returns revenue data for different time periods:
- Daily revenue (last 7 days)
- Weekly revenue (last 4 weeks)
- Monthly revenue (last 6 months)

Each data point includes:
- Date/period
- Revenue amount
- Platform fees

### User Activity

```
GET /user-activity
```

Returns user activity data for the last 7 days:
- Date
- Number of active users

## Error Handling

All endpoints return appropriate HTTP status codes:
- 200: Success
- 400: Bad request
- 401: Unauthorized
- 404: Not found
- 500: Server error

Error responses include a message and error details when appropriate.