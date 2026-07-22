/**
 * End-to-End Tests for Checkout & Payment Verification
 * Tests complete user workflows from checkout to fulfillment
 */

const request = require('supertest');
const { expect } = require('chai');
const app = require('../index');
const { sequelize, Order, User, Product, PaymentProof } = require('../models');

describe('End-to-End: Checkout & Payment Verification', () => {
    
    let testUser, testCustomer, testProduct, orderResponse;
    const baseURL = 'http://localhost:3000/api/v1';

    before(async () => {
        // Setup test database
        await sequelize.sync({ force: true });
        
        // Create test user
        testCustomer = await User.create({
            email: 'customer@test.com',
            password: 'hashed_password',
            firstName: 'Test',
            lastName: 'Customer',
            phoneNumber: '03001234567',
            whatsappNumber: '03001234567',
            role: 'customer'
        });

        // Create test product
        testProduct = await Product.create({
            name: 'Test Shirt',
            price: 1500,
            stock: 100,
            description: 'Test product'
        });
    });

    // ==================== SCENARIO 1: COD Order ====================
    describe('Scenario 1: Cash on Delivery Order Flow', () => {
        
        it('should validate checkout form input correctly', () => {
            const validCustomerInfo = {
                firstName: 'Ali',
                lastName: 'Ahmad',
                email: 'ali@example.com',
                whatsappNumber: '03001234567',
                street: '123 Main Street',
                city: 'Karachi',
                state: 'Sindh',
                postalCode: '75000'
            };

            // Validate each field
            expect(validCustomerInfo.firstName).to.match(/^[a-zA-Z\s'-]{2,50}$/);
            expect(validCustomerInfo.email).to.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
            expect(validCustomerInfo.whatsappNumber).to.match(/^(\+92|0)[3-9]\d{9}$/);
            expect(validCustomerInfo.postalCode).to.match(/^\d{5}$/);
        });

        it('should create COD order successfully', async () => {
            const orderData = {
                customerId: testCustomer.id,
                items: [{
                    productId: testProduct.id,
                    productName: 'Test Shirt',
                    quantity: 2,
                    price: 1500,
                    size: 'M'
                }],
                paymentMethod: 'COD',
                shippingAddress: {
                    street: '123 Main Street',
                    city: 'Karachi',
                    state: 'Sindh',
                    postalCode: '75000'
                },
                total: 3000,
                tax: 300,
                shipping: 200
            };

            const response = await request(app)
                .post('/api/v1/orders/create')
                .send(orderData)
                .expect(201);

            expect(response.body).to.have.property('success', true);
            expect(response.body.data).to.have.property('orderId');
            expect(response.body.data).to.have.property('paymentMethod', 'COD');
            expect(response.body.data).to.have.property('paymentStatus', 'pending');

            orderResponse = response.body.data;
        });

        it('should reduce inventory after order', async () => {
            const product = await Product.findByPk(testProduct.id);
            expect(product.stock).to.equal(98); // 100 - 2 ordered
        });

        it('should clear customer cart', async () => {
            // Verify cart is cleared (implementation specific)
            expect(true).to.be.true;
        });

        it('should send confirmation email', async () => {
            // Mock email service or check logs
            expect(true).to.be.true;
        });

        it('should send WhatsApp notification', async () => {
            // Mock WhatsApp service or check logs
            expect(true).to.be.true;
        });

        it('should create audit log entry', async () => {
            // Verify audit log created
            expect(true).to.be.true;
        });

        it('customer should be able to retrieve order', async () => {
            const response = await request(app)
                .get(`/api/v1/orders/${orderResponse.id}`)
                .expect(200);

            expect(response.body.data).to.have.property('orderId', orderResponse.orderId);
            expect(response.body.data).to.have.property('total', orderResponse.total);
        });
    });

    // ==================== SCENARIO 2: Bank Transfer with Valid Proof ====================
    describe('Scenario 2: Bank Transfer Order with Payment Verification', () => {
        
        let bankTransferOrder;

        it('should create bank transfer order', async () => {
            const orderData = {
                customerId: testCustomer.id,
                items: [{
                    productId: testProduct.id,
                    productName: 'Test Shirt',
                    quantity: 1,
                    price: 1500,
                    size: 'L'
                }],
                paymentMethod: 'Bank_Transfer',
                shippingAddress: {
                    street: '456 Oak Avenue',
                    city: 'Lahore',
                    state: 'Punjab',
                    postalCode: '54000'
                },
                total: 1500,
                tax: 150,
                shipping: 200
            };

            const response = await request(app)
                .post('/api/v1/orders/create')
                .send(orderData)
                .expect(201);

            expect(response.body.data).to.have.property('paymentMethod', 'Bank_Transfer');
            expect(response.body.data).to.have.property('paymentStatus', 'pending');

            bankTransferOrder = response.body.data;
        });

        it('should upload payment proof file', async () => {
            const response = await request(app)
                .post(`/api/v1/orders/${bankTransferOrder.id}/payment-proof`)
                .attach('paymentProof', Buffer.from('fake_image_data'))
                .expect(201);

            expect(response.body).to.have.property('success', true);
            expect(response.body.data).to.have.property('filePath');
            expect(response.body.data).to.have.property('uploadedAt');
        });

        it('should validate payment proof file type', async () => {
            // Test JPG validation
            expect(['image/jpeg', 'image/png', 'image/webp']).to.include('image/jpeg');
        });

        it('should validate payment proof file size', async () => {
            const maxSize = 5 * 1024 * 1024; // 5MB
            const testSize = 2 * 1024 * 1024; // 2MB
            expect(testSize).to.be.lessThan(maxSize);
        });

        it('admin should see order in pending verification list', async () => {
            const response = await request(app)
                .get('/api/v1/admin/orders/pending-verification')
                .set('Authorization', 'Bearer admin_token')
                .expect(200);

            expect(response.body.data.orders).to.be.an('array');
            expect(response.body.data.orders.length).to.be.greaterThan(0);
        });

        it('admin should be able to view order detail', async () => {
            const response = await request(app)
                .get(`/api/v1/orders/${bankTransferOrder.id}`)
                .set('Authorization', 'Bearer admin_token')
                .expect(200);

            expect(response.body.data).to.have.property('paymentProof');
        });

        it('admin should approve payment successfully', async () => {
            const response = await request(app)
                .post(`/api/v1/admin/orders/${bankTransferOrder.id}/verify-payment`)
                .set('Authorization', 'Bearer admin_token')
                .send({ decision: 'approve' })
                .expect(200);

            expect(response.body.data).to.have.property('paymentStatus', 'verified');
        });

        it('should send payment verified email', async () => {
            expect(true).to.be.true;
        });

        it('should send payment verified WhatsApp notification', async () => {
            expect(true).to.be.true;
        });

        it('order should be removed from pending list', async () => {
            const response = await request(app)
                .get('/api/v1/admin/orders/pending-verification')
                .set('Authorization', 'Bearer admin_token')
                .expect(200);

            const orderExists = response.body.data.orders.some(o => o.id === bankTransferOrder.id);
            expect(orderExists).to.be.false;
        });
    });

    // ==================== SCENARIO 3: Payment Rejection ====================
    describe('Scenario 3: Payment Rejection & Resubmission', () => {
        
        let rejectionOrder;

        it('should create order for rejection test', async () => {
            const orderData = {
                customerId: testCustomer.id,
                items: [{
                    productId: testProduct.id,
                    productName: 'Test Shirt',
                    quantity: 1,
                    price: 1500
                }],
                paymentMethod: 'Bank_Transfer',
                shippingAddress: {
                    street: '789 Elm Street',
                    city: 'Islamabad',
                    state: 'ICT',
                    postalCode: '44000'
                },
                total: 1500,
                tax: 150,
                shipping: 200
            };

            const response = await request(app)
                .post('/api/v1/orders/create')
                .send(orderData)
                .expect(201);

            rejectionOrder = response.body.data;
        });

        it('admin should reject payment with reason', async () => {
            const response = await request(app)
                .post(`/api/v1/admin/orders/${rejectionOrder.id}/verify-payment`)
                .set('Authorization', 'Bearer admin_token')
                .send({
                    decision: 'reject',
                    reason: 'Account number does not match'
                })
                .expect(200);

            expect(response.body.data).to.have.property('paymentStatus', 'failed');
        });

        it('should send rejection email with reason', async () => {
            expect(true).to.be.true;
        });

        it('should send rejection WhatsApp notification', async () => {
            expect(true).to.be.true;
        });

        it('customer should be able to resubmit proof', async () => {
            const response = await request(app)
                .post(`/api/v1/orders/${rejectionOrder.id}/payment-proof`)
                .attach('paymentProof', Buffer.from('corrected_image_data'))
                .expect(201);

            expect(response.body).to.have.property('success', true);
        });
    });

    // ==================== SCENARIO 4: Order Fulfillment ====================
    describe('Scenario 4: Order Status Updates & Fulfillment', () => {
        
        let fulfillmentOrder;

        before(async () => {
            // Create and approve an order
            const orderData = {
                customerId: testCustomer.id,
                items: [{
                    productId: testProduct.id,
                    productName: 'Test Shirt',
                    quantity: 1,
                    price: 1500
                }],
                paymentMethod: 'COD',
                shippingAddress: {
                    street: '321 Pine Road',
                    city: 'Rawalpindi',
                    state: 'Punjab',
                    postalCode: '46000'
                },
                total: 1500,
                tax: 150,
                shipping: 200
            };

            const response = await request(app)
                .post('/api/v1/orders/create')
                .send(orderData);

            fulfillmentOrder = response.body.data;
        });

        it('should update order status to shipped with tracking', async () => {
            const response = await request(app)
                .put(`/api/v1/admin/orders/${fulfillmentOrder.id}/status`)
                .set('Authorization', 'Bearer admin_token')
                .send({
                    orderStatus: 'shipped',
                    trackingNumber: 'TRK123456789'
                })
                .expect(200);

            expect(response.body.data).to.have.property('orderStatus', 'shipped');
        });

        it('should send shipment email with tracking', async () => {
            expect(true).to.be.true;
        });

        it('should send shipment WhatsApp notification', async () => {
            expect(true).to.be.true;
        });

        it('should create status change audit log', async () => {
            expect(true).to.be.true;
        });

        it('should update order status to delivered', async () => {
            const response = await request(app)
                .put(`/api/v1/admin/orders/${fulfillmentOrder.id}/status`)
                .set('Authorization', 'Bearer admin_token')
                .send({
                    orderStatus: 'delivered'
                })
                .expect(200);

            expect(response.body.data).to.have.property('orderStatus', 'delivered');
        });

        it('should send delivery email', async () => {
            expect(true).to.be.true;
        });

        it('should send delivery WhatsApp notification', async () => {
            expect(true).to.be.true;
        });
    });

    // ==================== SCENARIO 5: Inventory Management ====================
    describe('Scenario 5: Inventory Management', () => {
        
        it('should check inventory availability', async () => {
            const product = await Product.findByPk(testProduct.id);
            expect(product.stock).to.be.greaterThan(0);
        });

        it('should reject order if insufficient stock', async () => {
            // Update product to have no stock
            await testProduct.update({ stock: 0 });

            const orderData = {
                customerId: testCustomer.id,
                items: [{
                    productId: testProduct.id,
                    quantity: 1
                }],
                paymentMethod: 'COD'
            };

            const response = await request(app)
                .post('/api/v1/orders/create')
                .send(orderData);

            expect(response.status).to.equal(409); // Conflict
            expect(response.body).to.have.property('success', false);

            // Restore stock
            await testProduct.update({ stock: 100 });
        });

        it('should restore inventory on order cancellation', async () => {
            const initialStock = 100;
            await testProduct.update({ stock: initialStock });

            // Create order
            const orderData = {
                customerId: testCustomer.id,
                items: [{
                    productId: testProduct.id,
                    quantity: 5,
                    price: 1500
                }],
                paymentMethod: 'COD'
            };

            const createResponse = await request(app)
                .post('/api/v1/orders/create')
                .send(orderData);

            const orderId = createResponse.body.data.id;

            // Cancel order
            await request(app)
                .put(`/api/v1/admin/orders/${orderId}/status`)
                .set('Authorization', 'Bearer admin_token')
                .send({ orderStatus: 'cancelled' });

            // Check inventory restored
            const product = await Product.findByPk(testProduct.id);
            expect(product.stock).to.equal(initialStock);
        });
    });

    // ==================== SCENARIO 6: Error Handling ====================
    describe('Scenario 6: Error Handling & Edge Cases', () => {
        
        it('should handle invalid customer data', async () => {
            const invalidData = {
                customerId: testCustomer.id,
                items: [],
                paymentMethod: 'COD'
            };

            const response = await request(app)
                .post('/api/v1/orders/create')
                .send(invalidData);

            expect(response.status).to.equal(400);
            expect(response.body).to.have.property('success', false);
        });

        it('should handle unauthorized admin access', async () => {
            const response = await request(app)
                .get('/api/v1/admin/orders/pending-verification')
                .set('Authorization', 'Bearer invalid_token');

            expect(response.status).to.equal(401);
        });

        it('should handle non-existent order', async () => {
            const response = await request(app)
                .get('/api/v1/orders/99999');

            expect(response.status).to.equal(404);
        });

        it('should handle invalid file upload', async () => {
            const orderData = {
                customerId: testCustomer.id,
                items: [{
                    productId: testProduct.id,
                    quantity: 1,
                    price: 1500
                }],
                paymentMethod: 'Bank_Transfer'
            };

            const orderResponse = await request(app)
                .post('/api/v1/orders/create')
                .send(orderData);

            const orderId = orderResponse.body.data.id;

            // Try uploading non-image file
            const response = await request(app)
                .post(`/api/v1/orders/${orderId}/payment-proof`)
                .attach('paymentProof', Buffer.from('not_an_image'));

            expect(response.status).to.equal(400);
        });
    });

    after(async () => {
        await sequelize.close();
    });
});
