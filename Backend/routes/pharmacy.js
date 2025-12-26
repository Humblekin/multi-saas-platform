import express from "express";
import { db } from "../firebaseAdmin.js";
import auth from "../middleware/auth.js";
import { requireSubscription } from "../middleware/subscriptionCheck.js";

const router = express.Router();

// Apply subscription check to ALL pharmacy routes
router.use(auth, requireSubscription('Pharmacy'));

// ==================== DRUG ROUTES ====================

// GET all drugs with search and filter
router.get("/drugs", async (req, res) => {
    try {
        const { search, category, status } = req.query;
        let query = db.collection('drugs').where('userId', '==', req.user.id);

        // Firestore doesn't support complex $or regex natively like MongoDB
        // We'll fetch and filter in memory for simple search if needed, 
        // or just fetch all for the user and then filter.
        const snapshot = await query.get();
        let drugs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort in memory to avoid missing index error
        drugs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        if (search) {
            const searchLower = search.toLowerCase();
            drugs = drugs.filter(drug =>
                (drug.name && drug.name.toLowerCase().includes(searchLower)) ||
                (drug.genericName && drug.genericName.toLowerCase().includes(searchLower)) ||
                (drug.brandName && drug.brandName.toLowerCase().includes(searchLower)) ||
                (drug.batchNumber && drug.batchNumber.toLowerCase().includes(searchLower))
            );
        }

        if (category && category !== 'all') {
            drugs = drugs.filter(drug => drug.category === category);
        }

        if (status && status !== 'all') {
            drugs = drugs.filter(drug => drug.status === status);
        }

        res.json(drugs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// GET single drug by ID
router.get("/drugs/:id", async (req, res) => {
    try {
        const drugRef = db.collection('drugs').doc(req.params.id);
        const doc = await drugRef.get();

        if (!doc.exists || doc.data().userId !== req.user.id) {
            return res.status(404).json({ msg: "Drug not found" });
        }
        res.json({ id: doc.id, ...doc.data() });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// POST create new drug
router.post("/drugs", async (req, res) => {
    console.log("POST /drugs hit by user:", req.user.id);
    console.log("Body:", req.body);
    try {
        const {
            name, genericName, brandName, category, dosageForm, strength,
            manufacturer, batchNumber, barcode, quantity, unit, price, costPrice,
            expiryDate, manufactureDate, minStockLevel, maxStockLevel, location,
            requiresPrescription, sideEffects, dosageInstructions
        } = req.body;

        // Validation
        if (!name || !category || price === undefined || quantity === undefined) {
            return res.status(400).json({ msg: "Please provide all required fields" });
        }

        if (price < 0 || quantity < 0) {
            return res.status(400).json({ msg: "Price and quantity must be positive" });
        }

        const newDrug = {
            name,
            genericName: genericName || null,
            brandName: brandName || null,
            category,
            dosageForm: dosageForm || null,
            strength: strength || null,
            manufacturer: manufacturer || null,
            batchNumber: batchNumber || null,
            barcode: barcode || null,
            quantity: Number(quantity),
            unit: unit || 'units',
            price: Number(price),
            costPrice: Number(costPrice || 0),
            expiryDate: expiryDate || null,
            manufactureDate: manufactureDate || null,
            minStockLevel: Number(minStockLevel || 10),
            maxStockLevel: maxStockLevel ? Number(maxStockLevel) : null,
            location: location || null,
            requiresPrescription: requiresPrescription || false,
            sideEffects: sideEffects || null,
            dosageInstructions: dosageInstructions || null,
            status: 'active',
            userId: req.user.id,
            createdAt: new Date().toISOString()
        };

        // Remove any undefined fields just in case
        Object.keys(newDrug).forEach(key => newDrug[key] === undefined && delete newDrug[key]);

        const docRef = await db.collection('drugs').add(newDrug);
        return res.json({ id: docRef.id, ...newDrug });
    } catch (err) {
        console.error("Drug creation error:", err);
        res.status(500).json({ msg: "Server Error", error: err.message });
    }
});

// PUT update drug
router.put("/drugs/:id", async (req, res) => {
    try {
        const data = req.body;
        const drugRef = db.collection('drugs').doc(req.params.id);
        const doc = await drugRef.get();

        if (!doc.exists || doc.data().userId !== req.user.id) {
            return res.status(404).json({ msg: "Drug not found" });
        }

        // Filter out any unwanted fields and convert numbers
        const updates = {};
        const numericFields = ['quantity', 'price', 'costPrice', 'minStockLevel', 'maxStockLevel'];

        Object.keys(data).forEach(key => {
            if (numericFields.includes(key)) {
                updates[key] = Number(data[key]);
            } else {
                updates[key] = data[key];
            }
        });

        await drugRef.update(updates);
        const updatedDoc = await drugRef.get();

        res.json({ id: updatedDoc.id, ...updatedDoc.data() });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// DELETE drug
router.delete("/drugs/:id", async (req, res) => {
    try {
        const drugRef = db.collection('drugs').doc(req.params.id);
        const doc = await drugRef.get();

        if (!doc.exists || doc.data().userId !== req.user.id) {
            return res.status(404).json({ msg: "Drug not found" });
        }

        await drugRef.delete();
        res.json({ msg: "Drug removed" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});


// ==================== CATEGORY ROUTES ====================

// GET all drug categories
router.get("/categories", async (req, res) => {
    try {
        const snapshot = await db.collection('drugcategories')
            .where('userId', '==', req.user.id)
            .orderBy('name', 'asc')
            .get();
        const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(categories);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// POST create category
router.post("/categories", async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name) return res.status(400).json({ msg: "Category name is required" });

        const newCategory = {
            name,
            description,
            userId: req.user.id,
            createdAt: new Date().toISOString()
        };

        const docRef = await db.collection('drugcategories').add(newCategory);
        res.json({ id: docRef.id, ...newCategory });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// DELETE category
router.delete("/categories/:id", async (req, res) => {
    try {
        const docRef = db.collection('drugcategories').doc(req.params.id);
        const doc = await docRef.get();

        if (!doc.exists || doc.data().userId !== req.user.id) {
            return res.status(404).json({ msg: "Category not found" });
        }

        const category = doc.data();

        // Check if category has drugs
        const drugCountSnapshot = await db.collection('drugs')
            .where('category', '==', category.name)
            .where('userId', '==', req.user.id)
            .count()
            .get();

        if (drugCountSnapshot.data().count > 0) {
            return res.status(400).json({ msg: "Cannot delete category with existing drugs" });
        }

        await docRef.delete();
        res.json({ msg: "Category removed" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// ==================== PRESCRIPTION ROUTES ====================

// GET all prescriptions
router.get("/prescriptions", async (req, res) => {
    try {
        const { status } = req.query;
        let query = db.collection('prescriptions').where('userId', '==', req.user.id);

        if (status && status !== 'all') {
            query = query.where('status', '==', status);
        }

        const snapshot = await query.get();
        const prescriptions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort in memory if needed
        prescriptions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        res.json(prescriptions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// POST create prescription
router.post("/prescriptions", async (req, res) => {
    try {
        const { patientName, patientPhone, doctorName, drugs, notes } = req.body;

        if (!patientName || !doctorName || !drugs || drugs.length === 0) {
            return res.status(400).json({ msg: "Please provide all required fields" });
        }

        let totalAmount = 0;
        for (const item of drugs) {
            const drugSnapshot = await db.collection('drugs')
                .where('name', '==', item.drugName)
                .where('userId', '==', req.user.id)
                .get();

            if (!drugSnapshot.empty) {
                const drugData = drugSnapshot.docs[0].data();
                totalAmount += (drugData.price || 0) * item.quantity;
            }
        }

        const newPrescription = {
            patientName,
            patientPhone,
            doctorName,
            drugs,
            totalAmount,
            notes,
            status: 'pending',
            prescriptionNumber: `RX-${Date.now().toString().slice(-6)}`,
            userId: req.user.id,
            createdAt: new Date().toISOString()
        };

        const docRef = await db.collection('prescriptions').add(newPrescription);
        res.json({ id: docRef.id, ...newPrescription });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// PUT dispense prescription
router.put("/prescriptions/:id/dispense", async (req, res) => {
    try {
        const { dispensedBy } = req.body;
        const prescRef = db.collection('prescriptions').doc(req.params.id);
        const prescDoc = await prescRef.get();

        if (!prescDoc.exists || prescDoc.data().userId !== req.user.id) {
            return res.status(404).json({ msg: "Prescription not found" });
        }

        const prescription = prescDoc.data();
        if (prescription.status === 'dispensed') {
            return res.status(400).json({ msg: "Prescription already dispensed" });
        }

        const batch = db.batch();

        for (const item of prescription.drugs) {
            const drugSnapshot = await db.collection('drugs')
                .where('name', '==', item.drugName)
                .where('userId', '==', req.user.id)
                .get();

            if (!drugSnapshot.empty) {
                const drugDoc = drugSnapshot.docs[0];
                const drugData = drugDoc.data();
                if (drugData.quantity < item.quantity) {
                    return res.status(400).json({ msg: `Insufficient stock for ${item.drugName}` });
                }
                batch.update(drugDoc.ref, { quantity: drugData.quantity - item.quantity });
            }
        }

        const newSale = {
            drugName: prescription.drugs.map(d => d.drugName).join(', '),
            quantity: prescription.drugs.reduce((sum, d) => sum + d.quantity, 0),
            price: prescription.totalAmount / (prescription.drugs.reduce((sum, d) => sum + d.quantity, 0) || 1),
            customerName: prescription.patientName,
            total: prescription.totalAmount,
            prescriptionNumber: prescription.prescriptionNumber,
            userId: req.user.id,
            createdAt: new Date().toISOString()
        };

        const salesRef = db.collection('pharmacy_sales').doc();
        batch.set(salesRef, newSale);
        batch.update(prescRef, {
            status: 'dispensed',
            dispensedBy,
            dispensedAt: new Date().toISOString()
        });

        await batch.commit();
        res.json({ msg: 'Prescription dispensed successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// ==================== SALES ROUTES ====================

// GET all sales
router.get("/sales", async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let query = db.collection('pharmacy_sales').where('userId', '==', req.user.id);

        if (startDate && endDate) {
            query = query.where('createdAt', '>=', startDate).where('createdAt', '<=', endDate);
        }

        const snapshot = await query.get();
        const sales = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort in memory
        sales.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        res.json(sales);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// POST create new sale
router.post("/sales", async (req, res) => {
    try {
        const { drugName, quantity, price, customerName } = req.body;
        if (!drugName || !quantity || !price || !customerName) {
            return res.status(400).json({ msg: "Please provide all required fields" });
        }

        const q = Number(quantity);
        const p = Number(price);
        const total = q * p;

        const drugSnapshot = await db.collection('drugs')
            .where('name', '==', drugName)
            .where('userId', '==', req.user.id)
            .get();

        if (drugSnapshot.empty) return res.status(404).json({ msg: "Drug not found" });

        const drugDoc = drugSnapshot.docs[0];
        const drugData = drugDoc.data();

        if (drugData.quantity < q) return res.status(400).json({ msg: "Insufficient stock" });

        const batch = db.batch();
        const saleRef = db.collection('pharmacy_sales').doc();

        const newSale = {
            drugName,
            quantity: q,
            price: p,
            customerName,
            total,
            userId: req.user.id,
            createdAt: new Date().toISOString()
        };

        batch.set(saleRef, newSale);
        batch.update(drugDoc.ref, { quantity: drugData.quantity - q });

        await batch.commit();
        res.json({ id: saleRef.id, ...newSale });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// GET sales summary/stats
router.get("/sales/stats/summary", async (req, res) => {
    try {
        const [salesSnapshot, drugsSnapshot, categoriesCount] = await Promise.all([
            db.collection('pharmacy_sales').where('userId', '==', req.user.id).get(),
            db.collection('drugs').where('userId', '==', req.user.id).get(),
            db.collection('drugcategories').where('userId', '==', req.user.id).count().get()
        ]);

        const salesData = salesSnapshot.docs.map(doc => doc.data());
        const totalRevenue = salesData.reduce((acc, sale) => acc + (sale.total || 0), 0);

        const allDrugs = drugsSnapshot.docs.map(doc => doc.data());
        const activeDrugs = allDrugs.filter(d => d.status === 'active');

        const lowStock = activeDrugs.filter(drug => drug.quantity <= (drug.minStockLevel || 10)).length;
        const outOfStock = activeDrugs.filter(drug => drug.quantity === 0).length;

        const today = new Date();
        const expired = activeDrugs.filter(drug => drug.expiryDate && new Date(drug.expiryDate) < today).length;

        // Helper for expiring soon (usually within 3 months)
        const threeMonthsFromNow = new Date();
        threeMonthsFromNow.setMonth(today.getMonth() + 3);
        const expiringSoon = activeDrugs.filter(drug => drug.expiryDate && new Date(drug.expiryDate) > today && new Date(drug.expiryDate) < threeMonthsFromNow).length;

        const totalCost = activeDrugs.reduce((acc, drug) => acc + ((drug.costPrice || 0) * drug.quantity), 0);
        const totalValue = activeDrugs.reduce((acc, drug) => acc + ((drug.price || 0) * drug.quantity), 0);

        res.json({
            totalDrugs: activeDrugs.length,
            totalCategories: categoriesCount.data().count,
            totalSales: totalRevenue,
            totalSalesCount: salesSnapshot.size,
            lowStock,
            outOfStock,
            expired,
            expiringSoon,
            totalValue,
            totalCost,
            potentialProfit: totalValue - totalCost
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// GET alerts
router.get("/alerts", async (req, res) => {
    try {
        const drugsSnapshot = await db.collection('drugs')
            .where('userId', '==', req.user.id)
            .where('status', '==', 'active')
            .get();

        const drugs = drugsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const today = new Date();
        const threeMonthsFromNow = new Date();
        threeMonthsFromNow.setMonth(today.getMonth() + 3);

        const lowStock = drugs.filter(drug => drug.quantity <= (drug.minStockLevel || 10));
        const outOfStock = drugs.filter(drug => drug.quantity === 0);
        const expired = drugs.filter(drug => drug.expiryDate && new Date(drug.expiryDate) < today);
        const expiring = drugs.filter(drug => drug.expiryDate && new Date(drug.expiryDate) > today && new Date(drug.expiryDate) < threeMonthsFromNow);

        res.json({ lowStock, outOfStock, expiring, expired });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

export default router;


