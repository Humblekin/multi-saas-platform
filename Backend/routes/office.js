import express from 'express';
import { db } from '../firebaseAdmin.js';
import auth from '../middleware/auth.js';
import { requireSubscription } from '../middleware/subscriptionCheck.js';

const router = express.Router();

// Apply subscription check to ALL office routes
router.use(auth, requireSubscription('Office'));

// ==================== EMPLOYEE ROUTES ====================

// GET all employees
router.get('/employees', async (req, res) => {
    try {
        const snapshot = await db.collection('office_employees')
            .where('userId', '==', req.user.id)
            .get();
        const employees = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        employees.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        res.json(employees);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// POST create new employee
router.post('/employees', async (req, res) => {
    try {
        const { name, role, department, phone, email, salary, joinDate } = req.body;

        if (!name || !role || !department || !phone || !email || !salary) {
            return res.status(400).json({ msg: 'Please provide all required fields' });
        }

        const newEmployee = {
            name,
            role,
            department,
            phone,
            email,
            salary: Number(salary),
            joinDate: joinDate || new Date().toISOString(),
            userId: req.user.id,
            createdAt: new Date().toISOString()
        };

        const docRef = await db.collection('office_employees').add(newEmployee);
        res.json({ id: docRef.id, ...newEmployee });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// PUT update employee
router.put('/employees/:id', async (req, res) => {
    try {
        const data = req.body;
        const docRef = db.collection('office_employees').doc(req.params.id);
        const doc = await docRef.get();

        if (!doc.exists || doc.data().userId !== req.user.id) {
            return res.status(404).json({ msg: 'Employee not found' });
        }

        const updates = {};
        const fields = ['name', 'role', 'department', 'phone', 'email', 'salary', 'joinDate'];
        fields.forEach(f => {
            if (data[f] !== undefined) {
                updates[f] = (f === 'salary') ? Number(data[f]) : data[f];
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

// DELETE employee
router.delete('/employees/:id', async (req, res) => {
    try {
        const docRef = db.collection('office_employees').doc(req.params.id);
        const doc = await docRef.get();

        if (!doc.exists || doc.data().userId !== req.user.id) {
            return res.status(404).json({ msg: 'Employee not found' });
        }

        await docRef.delete();
        res.json({ msg: 'Employee removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ==================== ATTENDANCE ROUTES ====================

// GET all attendance records
router.get('/attendance', async (req, res) => {
    try {
        const snapshot = await db.collection('office_attendance')
            .where('userId', '==', req.user.id)
            .get();
        const attendance = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        attendance.sort((a, b) => new Date(b.date) - new Date(a.date));
        res.json(attendance);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// POST mark attendance
router.post('/attendance', async (req, res) => {
    try {
        const { employeeId, status, checkInTime, checkOutTime } = req.body;

        if (!employeeId || !status) {
            return res.status(400).json({ msg: 'Please provide employee and status' });
        }

        const empDoc = await db.collection('office_employees').doc(employeeId).get();
        if (!empDoc.exists || empDoc.data().userId !== req.user.id) {
            return res.status(404).json({ msg: 'Employee not found' });
        }

        const dateStr = new Date().toISOString().split('T')[0];

        const newAttendance = {
            employeeId,
            employeeName: empDoc.data().name,
            status,
            checkInTime: checkInTime || null,
            checkOutTime: checkOutTime || null,
            date: new Date().toISOString(),
            dateStr,
            userId: req.user.id
        };

        const docRef = await db.collection('office_attendance').add(newAttendance);
        res.json({ id: docRef.id, ...newAttendance });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// PUT update attendance
router.put('/attendance/:id', async (req, res) => {
    try {
        const data = req.body;
        const docRef = db.collection('office_attendance').doc(req.params.id);
        const doc = await docRef.get();

        if (!doc.exists || doc.data().userId !== req.user.id) {
            return res.status(404).json({ msg: 'Attendance record not found' });
        }

        const updates = {};
        if (data.status) updates.status = data.status;
        if (data.checkInTime) updates.checkInTime = data.checkInTime;
        if (data.checkOutTime) updates.checkOutTime = data.checkOutTime;

        await docRef.update(updates);
        const updatedDoc = await docRef.get();
        res.json({ id: updatedDoc.id, ...updatedDoc.data() });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// DELETE attendance
router.delete('/attendance/:id', async (req, res) => {
    try {
        const docRef = db.collection('office_attendance').doc(req.params.id);
        const doc = await docRef.get();

        if (!doc.exists || doc.data().userId !== req.user.id) {
            return res.status(404).json({ msg: 'Attendance record not found' });
        }

        await docRef.delete();
        res.json({ msg: 'Attendance record removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ==================== STATS ====================

// GET office stats
router.get('/stats', async (req, res) => {
    try {
        const dateStr = new Date().toISOString().split('T')[0];

        const [empCount, attnSnapshot] = await Promise.all([
            db.collection('office_employees').where('userId', '==', req.user.id).count().get(),
            db.collection('office_attendance')
                .where('userId', '==', req.user.id)
                .where('dateStr', '==', dateStr)
                .get()
        ]);

        const todayAttendance = attnSnapshot.docs.map(doc => doc.data());
        const presentCount = todayAttendance.filter(a => a.status === 'Present').length;
        const absentCount = todayAttendance.filter(a => a.status === 'Absent').length;

        res.json({
            totalEmployees: empCount.data().count,
            presentCount,
            absentCount
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

export default router;


