import express from 'express';
import { db } from '../firebaseAdmin.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
    try {
        const userDoc = await db.collection('users').doc(req.user.id).get();
        if (!userDoc.exists || userDoc.data().role !== 'admin') {
            return res.status(403).json({ msg: 'Access denied. Admin only.' });
        }
        next();
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// ==================== DASHBOARD STATS ====================

// GET admin dashboard stats
router.get('/stats', auth, isAdmin, async (req, res) => {
    try {
        const [usersSnapshot, drugsCount, productsCount, salesCount] = await Promise.all([
            db.collection('users').get(),
            db.collection('drugs').count().get(),
            db.collection('inventory_products').count().get(),
            db.collection('pharmacy_sales').count().get()
        ]);

        const users = usersSnapshot.docs.map(doc => doc.data());
        const totalUsers = users.length;
        const activeSubscriptions = users.filter(u => u.subscription?.isActive).length;
        const inactiveUsers = totalUsers - activeSubscriptions;
        const adminCount = users.filter(u => u.role === 'admin').length;

        const pharmacyUsers = users.filter(u => u.subscription?.planType === 'Pharmacy' && u.subscription?.isActive).length;
        const inventoryUsers = users.filter(u => u.subscription?.planType === 'Inventory' && u.subscription?.isActive).length;
        const schoolUsers = users.filter(u => u.subscription?.planType === 'School' && u.subscription?.isActive).length;
        const officeUsers = users.filter(u => u.subscription?.planType === 'Office' && u.subscription?.isActive).length;

        // Revenue calculation
        const monthlyRevenue = activeSubscriptions * 350;
        const yearlyRevenue = monthlyRevenue * 12;

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentRegistrations = users.filter(u => u.createdAt && new Date(u.createdAt) >= thirtyDaysAgo).length;

        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
        const today = new Date();
        const expiringSubscriptions = users.filter(u =>
            u.subscription?.isActive &&
            u.subscription?.endDate &&
            new Date(u.subscription.endDate) <= sevenDaysFromNow &&
            new Date(u.subscription.endDate) >= today
        ).length;

        res.json({
            users: {
                total: totalUsers,
                active: activeSubscriptions,
                inactive: inactiveUsers,
                admins: adminCount,
                recentRegistrations
            },
            subscriptions: {
                active: activeSubscriptions,
                expiring: expiringSubscriptions,
                pharmacy: pharmacyUsers,
                inventory: inventoryUsers,
                school: schoolUsers,
                office: officeUsers
            },
            systemData: {
                totalDrugs: drugsCount.data().count,
                totalProducts: productsCount.data().count,
                totalSales: salesCount.data().count
            },
            revenue: {
                monthly: monthlyRevenue,
                yearly: yearlyRevenue
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ==================== USER MANAGEMENT ====================

// GET all users
router.get('/users', auth, isAdmin, async (req, res) => {
    try {
        const { search, role, subscriptionStatus } = req.query;
        let query = db.collection('users');

        if (role && role !== 'all') {
            query = query.where('role', '==', role);
        }

        if (subscriptionStatus === 'active') {
            query = query.where('subscription.isActive', '==', true);
        } else if (subscriptionStatus === 'inactive') {
            query = query.where('subscription.isActive', '==', false);
        }

        const snapshot = await query.get();
        let users = snapshot.docs.map(doc => {
            const data = doc.data();
            delete data.password;
            delete data.resetPasswordToken;
            delete data.resetPasswordExpires;
            return { id: doc.id, ...data };
        });

        // Sort in memory
        users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        if (search) {
            const s = search.toLowerCase();
            users = users.filter(u =>
                (u.name && u.name.toLowerCase().includes(s)) ||
                (u.email && u.email.toLowerCase().includes(s))
            );
        }

        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// GET single user
router.get('/users/:id', auth, isAdmin, async (req, res) => {
    try {
        const doc = await db.collection('users').doc(req.params.id).get();
        if (!doc.exists) return res.status(404).json({ msg: 'User not found' });

        const data = doc.data();
        delete data.password;
        delete data.resetPasswordToken;
        delete data.resetPasswordExpires;
        res.json({ id: doc.id, ...data });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// PUT update user
router.put('/users/:id', auth, isAdmin, async (req, res) => {
    try {
        const data = req.body;
        const docRef = db.collection('users').doc(req.params.id);
        const doc = await docRef.get();
        if (!doc.exists) return res.status(404).json({ msg: 'User not found' });

        const updates = {};
        if (data.name) updates.name = data.name;
        if (data.email) updates.email = data.email;
        if (data.role) updates.role = data.role;
        if (data.subscription) updates.subscription = data.subscription;

        await docRef.update(updates);
        const updated = await docRef.get();
        const updatedData = updated.data();
        delete updatedData.password;
        res.json({ id: updated.id, ...updatedData });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// PUT activate/deactivate subscription
router.put('/users/:id/subscription', auth, isAdmin, async (req, res) => {
    try {
        const { isActive, planType, endDate } = req.body;
        const docRef = db.collection('users').doc(req.params.id);
        const doc = await docRef.get();
        if (!doc.exists) return res.status(404).json({ msg: 'User not found' });

        const user = doc.data();
        const subscription = user.subscription || {};

        if (isActive !== undefined) subscription.isActive = isActive;
        if (planType) subscription.planType = planType;
        if (endDate) subscription.endDate = endDate;
        if (isActive && !subscription.startDate) subscription.startDate = new Date().toISOString();

        await docRef.update({ subscription });
        res.json({ id: doc.id, ...user, subscription });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// DELETE user
router.delete('/users/:id', auth, isAdmin, async (req, res) => {
    try {
        if (req.params.id === req.user.id) {
            return res.status(400).json({ msg: 'Cannot delete your own account' });
        }
        const docRef = db.collection('users').doc(req.params.id);
        const doc = await docRef.get();
        if (!doc.exists) return res.status(404).json({ msg: 'User not found' });

        await docRef.delete();
        res.json({ msg: 'User removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ==================== SYSTEM MONITORING ====================

// GET system activity logs
router.get('/activity', auth, isAdmin, async (req, res) => {
    try {
        const { limit = 50 } = req.query;
        const snapshot = await db.collection('users')
            .orderBy('createdAt', 'desc')
            .limit(Number(limit))
            .get();

        const recentUsers = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name,
                email: data.email,
                createdAt: data.createdAt,
                subscription: data.subscription
            };
        });

        res.json({ recentUsers });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// GET expiring subscriptions
router.get('/expiring-subscriptions', auth, isAdmin, async (req, res) => {
    try {
        const { days = 7 } = req.query;
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + Number(days));
        const today = new Date();

        const snapshot = await db.collection('users')
            .where('subscription.isActive', '==', true)
            .get();

        const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const expiringUsers = users.filter(u =>
            u.subscription?.endDate &&
            new Date(u.subscription.endDate) <= futureDate &&
            new Date(u.subscription.endDate) >= today
        ).sort((a, b) => new Date(a.subscription.endDate) - new Date(b.subscription.endDate));

        res.json(expiringUsers);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// POST bulk activate subscriptions
router.post('/bulk/activate', auth, isAdmin, async (req, res) => {
    try {
        const { userIds, planType, duration } = req.body;
        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({ msg: 'Please provide user IDs' });
        }

        const startDate = new Date().toISOString();
        const endDateObj = new Date();
        endDateObj.setMonth(endDateObj.getMonth() + (duration || 12));
        const endDate = endDateObj.toISOString();

        const batch = db.batch();
        userIds.forEach(id => {
            const ref = db.collection('users').doc(id);
            batch.update(ref, {
                'subscription.isActive': true,
                'subscription.planType': planType,
                'subscription.startDate': startDate,
                'subscription.endDate': endDate
            });
        });

        await batch.commit();
        res.json({ msg: `${userIds.length} subscriptions activated` });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

export default router;

