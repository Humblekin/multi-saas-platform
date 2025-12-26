import express from "express";
import admin from "firebase-admin";
import { db } from "../firebaseAdmin.js";
import auth from "../middleware/auth.js";
import { requireSubscription } from "../middleware/subscriptionCheck.js";

const router = express.Router();

// Apply subscription check to ALL school routes
router.use(auth, requireSubscription("School"));

// ==================== TEACHER ROUTES ====================

// GET all teachers
router.get("/teachers", async (req, res) => {
  try {
    const snapshot = await db
      .collection("teachers")
      .where("userId", "==", req.user.id)
      .get();

    const teachers = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    teachers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(teachers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// POST create new teacher
router.post("/teachers", async (req, res) => {
  try {
    const { name, employeeId, subject, phone, email } = req.body;

    if (!name || !employeeId || !subject || !phone || !email) {
      return res
        .status(400)
        .json({ msg: "Please provide all required fields" });
    }

    // Check for duplicate employeeId (optional, but good practice)
    const duplicate = await db
      .collection("teachers")
      .where("userId", "==", req.user.id)
      .where("employeeId", "==", employeeId)
      .get();

    if (!duplicate.empty) {
      return res.status(400).json({ msg: "Employee ID already exists" });
    }

    const newTeacher = {
      name,
      employeeId,
      subject,
      phone,
      email,
      userId: req.user.id,
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection("teachers").add(newTeacher);
    res.json({ id: docRef.id, ...newTeacher });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// PUT update teacher
router.put("/teachers/:id", async (req, res) => {
  try {
    const { name, employeeId, subject, phone, email } = req.body;

    const teacherFields = {};
    if (name) teacherFields.name = name;
    if (employeeId) teacherFields.employeeId = employeeId;
    if (subject) teacherFields.subject = subject;
    if (phone) teacherFields.phone = phone;
    if (email) teacherFields.email = email;

    const teacherRef = db.collection("teachers").doc(req.params.id);
    const doc = await teacherRef.get();

    if (!doc.exists || doc.data().userId !== req.user.id) {
      return res.status(404).json({ msg: "Teacher not found" });
    }

    await teacherRef.update(teacherFields);
    const updatedDoc = await teacherRef.get();

    res.json({ id: updatedDoc.id, ...updatedDoc.data() });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// DELETE teacher
router.delete("/teachers/:id", async (req, res) => {
  try {
    const teacherRef = db.collection("teachers").doc(req.params.id);
    const doc = await teacherRef.get();

    if (!doc.exists || doc.data().userId !== req.user.id) {
      return res.status(404).json({ msg: "Teacher not found" });
    }

    await teacherRef.delete();
    res.json({ msg: "Teacher removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// ==================== STUDENT ROUTES ====================

// GET all students
router.get("/students", async (req, res) => {
  try {
    const snapshot = await db
      .collection("students")
      .where("userId", "==", req.user.id)
      .get();

    const students = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    students.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(students);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// POST create new student
router.post("/students", async (req, res) => {
  try {
    const { name, studentId, class: studentClass, age } = req.body;

    if (!name || !studentId || !studentClass || !age) {
      return res
        .status(400)
        .json({ msg: "Please provide all required fields" });
    }

    const duplicate = await db
      .collection("students")
      .where("userId", "==", req.user.id)
      .where("studentId", "==", studentId)
      .get();

    if (!duplicate.empty) {
      return res.status(400).json({ msg: "Student ID already exists" });
    }

    const newStudent = {
      name,
      studentId,
      class: studentClass,
      age,
      userId: req.user.id,
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection("students").add(newStudent);
    res.json({ id: docRef.id, ...newStudent });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// PUT update student
router.put("/students/:id", async (req, res) => {
  try {
    const { name, studentId, class: studentClass, age } = req.body;

    const studentFields = {};
    if (name) studentFields.name = name;
    if (studentId) studentFields.studentId = studentId;
    if (studentClass) studentFields.class = studentClass;
    if (age) studentFields.age = age;

    const studentRef = db.collection("students").doc(req.params.id);
    const doc = await studentRef.get();

    if (!doc.exists || doc.data().userId !== req.user.id) {
      return res.status(404).json({ msg: "Student not found" });
    }

    await studentRef.update(studentFields);
    const updatedDoc = await studentRef.get();

    res.json({ id: updatedDoc.id, ...updatedDoc.data() });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// DELETE student
router.delete("/students/:id", async (req, res) => {
  try {
    const studentRef = db.collection("students").doc(req.params.id);
    const doc = await studentRef.get();

    if (!doc.exists || doc.data().userId !== req.user.id) {
      return res.status(404).json({ msg: "Student not found" });
    }

    await studentRef.delete();
    res.json({ msg: "Student removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// ==================== GRADE ROUTES ====================

// GET all grades
router.get("/grades", async (req, res) => {
  try {
    const snapshot = await db
      .collection("grades")
      .where("userId", "==", req.user.id)
      .get();
    const grades = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    grades.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(grades);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// POST create new grade (Single or Batch)
router.post("/grades", async (req, res) => {
  try {
    // Handle Batch Entry
    if (Array.isArray(req.body)) {
      const batch = db.batch();
      const gradesRef = db.collection("grades");

      for (const item of req.body) {
        const { studentId, studentName, subject, score, grade, term } = item;
        if (!studentId || !subject || score === undefined || !term) continue;

        const existingSnapshot = await gradesRef
          .where("studentId", "==", studentId)
          .where("subject", "==", subject)
          .where("term", "==", term)
          .where("userId", "==", req.user.id)
          .get();

        if (!existingSnapshot.empty) {
          const docId = existingSnapshot.docs[0].id;
          batch.update(gradesRef.doc(docId), { score: Number(score), grade });
        } else {
          const newDocRef = gradesRef.doc();
          batch.set(newDocRef, {
            studentId,
            studentName,
            subject,
            score: Number(score),
            grade,
            term,
            userId: req.user.id,
            createdAt: new Date().toISOString(),
          });
        }
      }

      await batch.commit();
      return res.json({ msg: "Grades saved successfully" });
    }

    // Handle Single Entry
    const { studentId, studentName, subject, score, grade, term } = req.body;

    if (
      !studentId ||
      !studentName ||
      !subject ||
      score === undefined ||
      !grade ||
      !term
    ) {
      return res
        .status(400)
        .json({ msg: "Please provide all required fields" });
    }

    const existingSnapshot = await db
      .collection("grades")
      .where("studentId", "==", studentId)
      .where("subject", "==", subject)
      .where("term", "==", term)
      .where("userId", "==", req.user.id)
      .get();

    if (!existingSnapshot.empty) {
      return res
        .status(400)
        .json({ msg: "Grade for this subject already exists for this term" });
    }

    const newGrade = {
      studentId,
      studentName,
      subject,
      score: Number(score),
      grade,
      term,
      userId: req.user.id,
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection("grades").add(newGrade);
    res.json({ id: docRef.id, ...newGrade });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// DELETE grade
router.delete("/grades/:id", async (req, res) => {
  try {
    const gradeRef = db.collection("grades").doc(req.params.id);
    const doc = await gradeRef.get();

    if (!doc.exists || doc.data().userId !== req.user.id) {
      return res.status(404).json({ msg: "Grade not found" });
    }

    await gradeRef.delete();
    res.json({ msg: "Grade removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// ==================== REPORT CARD ====================

// GET report card for a student and term
router.get("/report-card/:studentId/:term", async (req, res) => {
  try {
    const { studentId, term } = req.params;

    const studentDoc = await db.collection("students").doc(studentId).get();
    if (!studentDoc.exists || studentDoc.data().userId !== req.user.id) {
      return res.status(404).json({ msg: "Student not found" });
    }
    const student = { id: studentDoc.id, ...studentDoc.data() };

    const gradesSnapshot = await db
      .collection("grades")
      .where("studentId", "==", studentId)
      .where("term", "==", term)
      .where("userId", "==", req.user.id)
      .get();

    const grades = gradesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    if (grades.length === 0) {
      return res
        .status(404)
        .json({ msg: "No grades found for this student and term" });
    }

    const totalScore = grades.reduce((sum, g) => sum + g.score, 0);
    const average = totalScore / grades.length;

    let overallGrade = "F";
    if (average >= 80) overallGrade = "A";
    else if (average >= 70) overallGrade = "B";
    else if (average >= 60) overallGrade = "C";
    else if (average >= 50) overallGrade = "D";
    else if (average >= 40) overallGrade = "E";

    const reportCardSnapshot = await db
      .collection("reportcards")
      .where("studentId", "==", studentId)
      .where("term", "==", term)
      .where("userId", "==", req.user.id)
      .get();

    if (reportCardSnapshot.empty) {
      return res.json({
        student,
        term,
        grades,
        average: average.toFixed(2),
        overallGrade,
        teacherRemarks: "",
        principalRemarks: "",
        teacherSignature: false,
        principalSignature: false,
        promotionStatus: "Promoted",
        nextClass: "",
        isSaved: false,
      });
    }

    const savedReportCard = reportCardSnapshot.docs[0].data();
    res.json({
      student,
      term,
      grades,
      average: average.toFixed(2),
      overallGrade,
      teacherRemarks: savedReportCard.teacherRemarks,
      principalRemarks: savedReportCard.principalRemarks,
      teacherSignature: savedReportCard.teacherSignature,
      principalSignature: savedReportCard.principalSignature,
      promotionStatus: savedReportCard.promotionStatus,
      nextClass: savedReportCard.nextClass,
      isSaved: true,
      reportCardId: reportCardSnapshot.docs[0].id,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// POST save/create report card
router.post("/report-card", async (req, res) => {
  try {
    const {
      studentId,
      studentName,
      term,
      teacherRemarks,
      principalRemarks,
      teacherSignature,
      principalSignature,
      promotionStatus,
      nextClass,
    } = req.body;

    if (!studentId || !term) {
      return res.status(400).json({ msg: "Student ID and term are required" });
    }

    const gradesSnapshot = await db
      .collection("grades")
      .where("studentId", "==", studentId)
      .where("term", "==", term)
      .where("userId", "==", req.user.id)
      .get();

    const grades = gradesSnapshot.docs.map((doc) => doc.data());

    if (grades.length === 0) {
      return res
        .status(400)
        .json({ msg: "No grades found for this student and term" });
    }

    const totalScore = grades.reduce((sum, g) => sum + g.score, 0);
    const average = totalScore / grades.length;

    let overallGrade = "F";
    if (average >= 80) overallGrade = "A";
    else if (average >= 70) overallGrade = "B";
    else if (average >= 60) overallGrade = "C";
    else if (average >= 50) overallGrade = "D";
    else if (average >= 40) overallGrade = "E";

    const existingSnapshot = await db
      .collection("reportcards")
      .where("studentId", "==", studentId)
      .where("term", "==", term)
      .where("userId", "==", req.user.id)
      .get();

    if (!existingSnapshot.empty) {
      return res.status(400).json({ msg: "Report card already exists" });
    }

    const newReportCard = {
      studentId,
      studentName,
      term,
      grades: grades.map((g) => ({
        subject: g.subject,
        score: g.score,
        grade: g.grade,
      })),
      average: Number(average.toFixed(2)),
      overallGrade,
      teacherRemarks: teacherRemarks || "",
      principalRemarks: principalRemarks || "",
      teacherSignature: teacherSignature || false,
      principalSignature: principalSignature || false,
      promotionStatus: promotionStatus || "Promoted",
      nextClass: nextClass || "",
      userId: req.user.id,
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection("reportcards").add(newReportCard);
    res.json({ id: docRef.id, ...newReportCard });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// PUT update report card
router.put("/report-card/:studentId/:term", async (req, res) => {
  try {
    const { studentId, term } = req.params;
    const updates = req.body;

    const snapshot = await db
      .collection("reportcards")
      .where("studentId", "==", studentId)
      .where("term", "==", term)
      .where("userId", "==", req.user.id)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ msg: "Report card not found" });
    }

    const docRef = snapshot.docs[0].ref;
    await docRef.update(updates);
    res.json({ msg: "Report card updated" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// GET all report cards
router.get("/report-cards", async (req, res) => {
  try {
    const snapshot = await db
      .collection("reportcards")
      .where("userId", "==", req.user.id)
      .get();
    const reportCards = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    reportCards.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(reportCards);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// DELETE report card
router.delete("/report-card/:id", async (req, res) => {
  try {
    const docRef = db.collection("reportcards").doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists || doc.data().userId !== req.user.id) {
      return res.status(404).json({ msg: "Report card not found" });
    }
    await docRef.delete();
    res.json({ msg: "Report card deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// ==================== FEE ROUTES ====================

// GET all fees
router.get("/fees", async (req, res) => {
  try {
    const snapshot = await db
      .collection("fees")
      .where("userId", "==", req.user.id)
      .get();
    const fees = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    fees.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(fees);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// POST create new fee
router.post("/fees", async (req, res) => {
  try {
    const { studentId, studentName, amount, type, status, term } = req.body;
    if (!studentId || !studentName || !amount || !type || !term) {
      return res
        .status(400)
        .json({ msg: "Please provide all required fields" });
    }

    const newFee = {
      studentId,
      studentName,
      amount: Number(amount),
      type,
      status: status || "Paid",
      term,
      userId: req.user.id,
      date: new Date().toISOString(),
    };

    const docRef = await db.collection("fees").add(newFee);
    res.json({ id: docRef.id, ...newFee });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// DELETE fee
router.delete("/fees/:id", async (req, res) => {
  try {
    const docRef = db.collection("fees").doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists || doc.data().userId !== req.user.id) {
      return res.status(404).json({ msg: "Fee record not found" });
    }
    await docRef.delete();
    res.json({ msg: "Fee removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// ==================== STUDENT ATTENDANCE ROUTES ====================

// GET attendance
router.get("/attendance", async (req, res) => {
  try {
    const { date, class: studentClass } = req.query;
    let query = db.collection("attendance").where("userId", "==", req.user.id);

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      // Note: date filtering might be tricky with ISO strings,
      // usually better to store as Timestamps if filtering a lot.
      // For now, assuming date is stored as string 'YYYY-MM-DD'
      query = query.where("dateStr", "==", date);
    }

    if (studentClass) {
      query = query.where("class", "==", studentClass);
    }

    const snapshot = await query.get();
    const attendance = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.json(attendance);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// POST mark attendance
router.post("/attendance", async (req, res) => {
  try {
    const {
      studentId,
      studentName,
      status,
      class: studentClass,
      term,
      date,
    } = req.body;
    if (!studentId || !status || !studentClass) {
      return res
        .status(400)
        .json({ msg: "Please provide all required fields" });
    }

    const dateStr = date || new Date().toISOString().split("T")[0];

    const existingSnapshot = await db
      .collection("attendance")
      .where("studentId", "==", studentId)
      .where("dateStr", "==", dateStr)
      .where("userId", "==", req.user.id)
      .get();

    if (!existingSnapshot.empty) {
      const docRef = existingSnapshot.docs[0].ref;
      await docRef.update({ status });
      const updated = await docRef.get();
      return res.json({ id: updated.id, ...updated.data() });
    }

    const newAttendance = {
      studentId,
      studentName,
      status,
      class: studentClass,
      term: term || "Term 1",
      dateStr,
      createdAt: new Date().toISOString(),
      userId: req.user.id,
    };

    const docRef = await db.collection("attendance").add(newAttendance);
    res.json({ id: docRef.id, ...newAttendance });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// GET school stats
router.get("/stats", async (req, res) => {
  try {
    const [students, teachers, grades, fees] = await Promise.all([
      db
        .collection("students")
        .where("userId", "==", req.user.id)
        .count()
        .get(),
      db
        .collection("teachers")
        .where("userId", "==", req.user.id)
        .count()
        .get(),
      db.collection("grades").where("userId", "==", req.user.id).count().get(),
      db
        .collection("fees")
        .where("userId", "==", req.user.id)
        .where("status", "==", "Paid")
        .get(),
    ]);

    const totalFees = fees.docs.reduce(
      (sum, doc) => sum + (doc.data().amount || 0),
      0
    );

    res.json({
      totalStudents: students.data().count,
      totalTeachers: teachers.data().count,
      totalGrades: grades.data().count,
      totalFees,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// ==================== SUBJECT ROUTES ====================

// GET all subjects
router.get("/subjects", async (req, res) => {
  try {
    const snapshot = await db
      .collection("subjects")
      .where("userId", "==", req.user.id)
      .get();
    const subjects = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    subjects.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    res.json(subjects);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// POST create new subject
router.post("/subjects", async (req, res) => {
  try {
    const { name, code, description } = req.body;
    if (!name) return res.status(400).json({ msg: "Subject name is required" });

    const existingSnapshot = await db
      .collection("subjects")
      .where("name", "==", name)
      .where("userId", "==", req.user.id)
      .get();

    if (!existingSnapshot.empty)
      return res.status(400).json({ msg: "Subject already exists" });

    const newSubject = {
      name,
      code,
      description,
      userId: req.user.id,
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection("subjects").add(newSubject);
    res.json({ id: docRef.id, ...newSubject });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// PUT update subject
router.put("/subjects/:id", async (req, res) => {
  try {
    const { name, code, description } = req.body;
    const docRef = db.collection("subjects").doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists || doc.data().userId !== req.user.id) {
      return res.status(404).json({ msg: "Subject not found" });
    }

    const updates = {};
    if (name) updates.name = name;
    if (code) updates.code = code;
    if (description) updates.description = description;

    await docRef.update(updates);
    const updated = await docRef.get();
    res.json({ id: updated.id, ...updated.data() });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// DELETE subject
router.delete("/subjects/:id", async (req, res) => {
  try {
    const docRef = db.collection("subjects").doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists || doc.data().userId !== req.user.id) {
      return res.status(404).json({ msg: "Subject not found" });
    }
    await docRef.delete();
    res.json({ msg: "Subject deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// ==================== SCHOOL PROFILE ROUTES ====================

// GET school profile
router.get("/profile", async (req, res) => {
  try {
    const snapshot = await db
      .collection("schoolprofiles")
      .where("userId", "==", req.user.id)
      .get();

    let profile = {
      schoolName: "SAAS ACADEMY",
      address: "123 Education Lane, Knowledge City, GH",
      phone: "+233 55 123 4567",
      email: "info@saasacademy.com",
      motto: "",
      logo: "",
      principalName: "",
      establishedYear: "",
      website: "",
    };

    if (!snapshot.empty) {
      profile = snapshot.docs[0].data();
    }

    // Also fetch logo from separate collection
    try {
      const logoDoc = await db.collection("schoollogos").doc(req.user.id).get();
      if (logoDoc.exists && logoDoc.data().logo) {
        profile.logo = logoDoc.data().logo;
      }
    } catch (logoErr) {
      console.error("Error fetching logo:", logoErr.message);
    }

    res.json({ id: snapshot.empty ? null : snapshot.docs[0].id, ...profile });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// POST/PUT create or update school profile
router.post("/profile", async (req, res) => {
  try {
    const data = req.body;

    // Handle logo - store separately if present
    let logoData = null;
    const { logo, ...profileData } = data;

    if (logo && logo.startsWith("data:image")) {
      // Check logo size (max 1MB base64 = roughly 750KB image)
      if (logo.length > 1024 * 1024) {
        return res
          .status(400)
          .json({ msg: "Logo file is too large. Maximum 2MB." });
      }
      // Store logo in a separate sub-collection to avoid size issues
      logoData = logo;
    }

    const snapshot = await db
      .collection("schoolprofiles")
      .where("userId", "==", req.user.id)
      .get();

    let profileRef;
    if (!snapshot.empty) {
      profileRef = snapshot.docs[0].ref;
      await profileRef.update(profileData);
    } else {
      const newProfile = {
        ...profileData,
        userId: req.user.id,
        schoolName: profileData.schoolName || "SAAS ACADEMY",
        createdAt: new Date().toISOString(),
      };
      profileRef = await db.collection("schoolprofiles").add(newProfile);
    }

    // If logo data exists, store it in a separate document
    if (logoData) {
      try {
        await db.collection("schoollogos").doc(req.user.id).set(
          {
            logo: logoData,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (logoErr) {
        console.error("Logo storage error:", logoErr.message);
        // Continue without logo rather than failing the entire profile update
      }
    }

    const updated = await profileRef.get();
    const logoDoc = await db.collection("schoollogos").doc(req.user.id).get();
    const logoFromStorage = logoDoc.exists ? logoDoc.data().logo : null;

    res.json({
      id: updated.id,
      ...updated.data(),
      logo: logoFromStorage,
    });
  } catch (err) {
    console.error("Profile update error:", err.message);
    res.status(500).json({ msg: err.message || "Failed to update profile" });
  }
});

// GET school logo
router.get("/profile/logo", async (req, res) => {
  try {
    const logoDoc = await db.collection("schoollogos").doc(req.user.id).get();
    if (logoDoc.exists) {
      res.json({ logo: logoDoc.data().logo });
    } else {
      res.json({ logo: null });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Failed to fetch logo" });
  }
});

export default router;
