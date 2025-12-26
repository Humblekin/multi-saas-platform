import express from 'express';
import { db } from '../firebaseAdmin.js';
import auth from '../middleware/auth.js';
import { requireSubscription } from '../middleware/subscriptionCheck.js';

const router = express.Router();

// Apply subscription check to ALL inventory routes
router.use(auth, requireSubscription('Inventory'));

// ==================== PRODUCT ROUTES ====================

// GET all products with search and filter
router.get('/products', async (req, res) => {
    try {
        const { search, category, status } = req.query;
        let query = db.collection('inventory_products').where('userId', '==', req.user.id);

        if (category && category !== 'all') {
            query = query.where('category', '==', category);
        }

        if (status && status !== 'all') {
            query = query.where('status', '==', status);
        }

        const snapshot = await query.get();
        let products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // In-memory filtering for search (Firestore doesn't support regex)
        if (search) {
            const searchLower = search.toLowerCase();
            products = products.filter(p =>
                (p.name && p.name.toLowerCase().includes(searchLower)) ||
                (p.sku && p.sku.toLowerCase().includes(searchLower)) ||
                (p.description && p.description.toLowerCase().includes(searchLower))
            );
        }

        res.json(products);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// GET single product
router.get('/products/:id', async (req, res) => {
    try {
        const docRef = db.collection('inventory_products').doc(req.params.id);
        const doc = await docRef.get();
        if (!doc.exists || doc.data().userId !== req.user.id) {
            return res.status(404).json({ msg: 'Product not found' });
        }
        res.json({ id: doc.id, ...doc.data() });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// POST create new product
router.post('/products', async (req, res) => {
    try {
        const data = req.body;
        const { name, category, price, quantity, supplier } = data;

        if (!name || !category || price === undefined || quantity === undefined || !supplier) {
            return res.status(400).json({ msg: 'Please provide all required fields' });
        }

        const newProduct = {
            ...data,
            price: Number(price),
            costPrice: Number(data.costPrice || 0),
            quantity: Number(quantity),
            minStockLevel: Number(data.minStockLevel || 10),
            maxStockLevel: data.maxStockLevel ? Number(data.maxStockLevel) : null,
            userId: req.user.id,
            status: data.status || 'active',
            unit: data.unit || 'pcs',
            createdAt: new Date().toISOString()
        };

        const batch = db.batch();
        const prodRef = db.collection('inventory_products').doc();
        batch.set(prodRef, newProduct);

        const moveRef = db.collection('inventory_movements').doc();
        batch.set(moveRef, {
            productId: prodRef.id,
            productName: name,
            type: 'IN',
            quantity: Number(quantity),
            reason: 'Initial Stock',
            previousStock: 0,
            newStock: Number(quantity),
            userId: req.user.id,
            createdAt: new Date().toISOString()
        });

        await batch.commit();
        res.json({ id: prodRef.id, ...newProduct });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// PUT update product
router.put('/products/:id', async (req, res) => {
    try {
        const data = req.body;
        const docRef = db.collection('inventory_products').doc(req.params.id);
        const doc = await docRef.get();

        if (!doc.exists || doc.data().userId !== req.user.id) {
            return res.status(404).json({ msg: 'Product not found' });
        }

        const updates = {};
        const fields = ['name', 'sku', 'category', 'price', 'costPrice', 'quantity', 'minStockLevel', 'maxStockLevel', 'supplier', 'description', 'unit', 'location', 'barcode', 'status'];

        fields.forEach(f => {
            if (data[f] !== undefined) {
                updates[f] = (['price', 'costPrice', 'quantity', 'minStockLevel', 'maxStockLevel'].includes(f)) ? Number(data[f]) : data[f];
            }
        });

        await docRef.update(updates);
        const updatedDoc = await docRef.get();
        res.json({ id: updatedDoc.id, ...updatedDoc.data() });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// POST adjust stock
router.post('/products/:id/adjust-stock', async (req, res) => {
    try {
        const { type, quantity, reason, reference } = req.body;
        if (!type || !quantity || !reason) {
            return res.status(400).json({ msg: 'Please provide type, quantity, and reason' });
        }

        const docRef = db.collection('inventory_products').doc(req.params.id);
        const doc = await docRef.get();

        if (!doc.exists || doc.data().userId !== req.user.id) {
            return res.status(404).json({ msg: 'Product not found' });
        }

        const product = doc.data();
        const previousStock = product.quantity || 0;
        let newStock = previousStock;
        const q = Number(quantity);

        if (type === 'IN') newStock = previousStock + q;
        else if (type === 'OUT') {
            if (previousStock < q) return res.status(400).json({ msg: 'Insufficient stock' });
            newStock = previousStock - q;
        } else if (type === 'ADJUSTMENT') newStock = q;

        const batch = db.batch();
        batch.update(docRef, { quantity: newStock });

        const moveRef = db.collection('inventory_movements').doc();
        batch.set(moveRef, {
            productId: doc.id,
            productName: product.name,
            type,
            quantity: q,
            reason,
            reference: reference || '',
            previousStock,
            newStock,
            userId: req.user.id,
            createdAt: new Date().toISOString()
        });

        await batch.commit();
        res.json({ id: doc.id, ...product, quantity: newStock });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// DELETE product
router.delete('/products/:id', async (req, res) => {
    try {
        const docRef = db.collection('inventory_products').doc(req.params.id);
        const doc = await docRef.get();
        if (!doc.exists || doc.data().userId !== req.user.id) {
            return res.status(404).json({ msg: 'Product not found' });
        }
        await docRef.delete();
        res.json({ msg: 'Product removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ==================== CATEGORY ROUTES ====================

// GET all categories
router.get('/categories', async (req, res) => {
    try {
        const snapshot = await db.collection('inventory_categories')
            .where('userId', '==', req.user.id)
            .get();
        const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        categories.sort((a, b) => a.name.localeCompare(b.name));
        res.json(categories);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// POST create category
router.post('/categories', async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name) return res.status(400).json({ msg: 'Category name is required' });

        const newCategory = {
            name,
            description,
            userId: req.user.id,
            createdAt: new Date().toISOString()
        };

        const docRef = await db.collection('inventory_categories').add(newCategory);
        res.json({ id: docRef.id, ...newCategory });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// DELETE category
router.delete('/categories/:id', async (req, res) => {
    try {
        const docRef = db.collection('inventory_categories').doc(req.params.id);
        const doc = await docRef.get();
        if (!doc.exists || doc.data().userId !== req.user.id) {
            return res.status(404).json({ msg: 'Category not found' });
        }

        const category = doc.data();
        const prodCountSnapshot = await db.collection('inventory_products')
            .where('category', '==', category.name)
            .where('userId', '==', req.user.id)
            .count().get();

        if (prodCountSnapshot.data().count > 0) {
            return res.status(400).json({ msg: 'Cannot delete category with existing products' });
        }

        await docRef.delete();
        res.json({ msg: 'Category removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ==================== STOCK MOVEMENT ROUTES ====================

// GET stock movements
router.get('/stock-movements', async (req, res) => {
    try {
        const { productId, type, limit = 50 } = req.query;
        let query = db.collection('inventory_movements').where('userId', '==', req.user.id);

        if (productId) query = query.where('productId', '==', productId);
        if (type && type !== 'all') query = query.where('type', '==', type);

        const snapshot = await query.get();
        const movements = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        movements.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        res.json(movements.slice(0, Number(limit)));
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ==================== SUPPLIER ROUTES ====================

// GET all suppliers
router.get('/suppliers', async (req, res) => {
    try {
        const snapshot = await db.collection('inventory_suppliers')
            .where('userId', '==', req.user.id)
            .get();
        const suppliers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        suppliers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        res.json(suppliers);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// POST create new supplier
router.post('/suppliers', async (req, res) => {
    try {
        const { name, contactPerson, phone, email, address, products } = req.body;

        if (!name || !contactPerson || !phone || !email || !address) {
            return res.status(400).json({ msg: 'Please provide all required fields' });
        }

        const newSupplier = {
            name,
            contactPerson,
            phone,
            email,
            address,
            products: products || [],
            userId: req.user.id,
            createdAt: new Date().toISOString()
        };

        const docRef = await db.collection('inventory_suppliers').add(newSupplier);
        res.json({ id: docRef.id, ...newSupplier });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// PUT update supplier
router.put('/suppliers/:id', async (req, res) => {
    try {
        const data = req.body;
        const docRef = db.collection('inventory_suppliers').doc(req.params.id);
        const doc = await docRef.get();

        if (!doc.exists || doc.data().userId !== req.user.id) {
            return res.status(404).json({ msg: 'Supplier not found' });
        }

        const updates = {};
        const fields = ['name', 'contactPerson', 'phone', 'email', 'address', 'products'];
        fields.forEach(f => {
            if (data[f] !== undefined) updates[f] = data[f];
        });

        await docRef.update(updates);
        const updatedDoc = await docRef.get();
        res.json({ id: updatedDoc.id, ...updatedDoc.data() });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// DELETE supplier
router.delete('/suppliers/:id', async (req, res) => {
    try {
        const docRef = db.collection('inventory_suppliers').doc(req.params.id);
        const doc = await docRef.get();
        if (!doc.exists || doc.data().userId !== req.user.id) {
            return res.status(404).json({ msg: 'Supplier not found' });
        }
        await docRef.delete();
        res.json({ msg: 'Supplier removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ==================== ALERTS & STATS ====================

// GET low stock alerts
router.get('/alerts', async (req, res) => {
    try {
        const snapshot = await db.collection('inventory_products')
            .where('userId', '==', req.user.id)
            .where('status', '==', 'active')
            .get();

        const products = snapshot.docs.map(doc => doc.data());
        const lowStock = products.filter(p => p.quantity <= (p.minStockLevel || 10));
        const outOfStock = products.filter(p => p.quantity === 0);

        res.json({ lowStock, outOfStock });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// GET inventory stats
router.get('/stats', async (req, res) => {
    try {
        const [prodCount, suppCount, catCount, prodSnapshot] = await Promise.all([
            db.collection('inventory_products').where('userId', '==', req.user.id).count().get(),
            db.collection('inventory_suppliers').where('userId', '==', req.user.id).count().get(),
            db.collection('inventory_categories').where('userId', '==', req.user.id).count().get(),
            db.collection('inventory_products').where('userId', '==', req.user.id).get()
        ]);

        const products = prodSnapshot.docs.map(doc => doc.data());
        const activeProducts = products.filter(p => p.status === 'active');

        const lowStockCount = activeProducts.filter(p => p.quantity <= (p.minStockLevel || 10)).length;
        const outOfStockCount = activeProducts.filter(p => p.quantity === 0).length;
        const totalValue = activeProducts.reduce((acc, p) => acc + ((p.price || 0) * (p.quantity || 0)), 0);
        const totalCost = activeProducts.reduce((acc, p) => acc + ((p.costPrice || 0) * (p.quantity || 0)), 0);

        res.json({
            totalProducts: prodCount.data().count,
            totalSuppliers: suppCount.data().count,
            totalCategories: catCount.data().count,
            lowStockCount,
            outOfStockCount,
            totalValue,
            totalCost,
            potentialProfit: totalValue - totalCost
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

export default router;


