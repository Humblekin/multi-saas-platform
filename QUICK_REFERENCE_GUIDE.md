# 🎓 School System - Quick Reference Guide

## 📚 Subject Selection (Already Working!)

**Location**: Grades Page → Add Grade Form

**How it works**:
```javascript
// Backend automatically fetches subjects
GET /school/subjects

// Frontend displays in dropdown
<select>
  <option>Select Subject</option>
  <option>Mathematics</option>
  <option>English</option>
  <option>Science</option>
  ... (all your school subjects)
</select>
```

**What you need to do**:
1. Go to "Subjects" page
2. Add all subjects your school offers
3. They automatically appear in the grades dropdown ✅


## 📝 Filling Student Report Cards

### Step-by-Step Process:

#### A. Enter Grades (For Each Subject)
1. Navigate to **Grades** page
2. Click **"+ Add Grade"**
3. Select **Student** from dropdown
4. Select **Subject** from dropdown (shows all subjects!)
5. Enter **Score** (0-100)
6. Grade calculates automatically (A, B, C, D, F)
7. Enter **Term** (e.g., "Term 1, 2024")
8. Click **"Add Grade"**

#### B. Generate & Save Report Card
1. Navigate to **Students** or directly to report card view
2. Select the **student**
3. Select the **term** from dropdown
4. System loads all grades for that student in that term

#### C. Complete Report Card Details
Fill in these fields:

**Teacher's Remarks**:
```
Example: "John has shown great improvement in Mathematics. 
He participates actively in class discussions."
```

**Principal's Remarks**:
```
Example: "An excellent student who demonstrates leadership 
qualities. Keep up the good work!"
```

**Signatures**:
- ☑ Teacher has signed (checkbox)
- ☑ Principal has signed (checkbox)

**Promotion Status** (select one):
- ○ Promoted
- ○ Demoted
- ○ Repeated
- ○ Withdrawn

**Next Class**:
```
Example: "Form 2" or "Grade 7"
```

#### D. Save the Report Card
1. Click **"💾 Save Report Card"**
2. You'll see: ✅ "Report card saved successfully!"
3. Button changes to **"💾 Update Report Card"** for future edits

#### E. Print Report Card
1. Click **"🖨️ Print Report Card"**
2. System opens print dialog
3. Report card has professional format ready for printing


## 🎯 Important Notes

### Validation Rules:
- **Minimum 6 subjects** required per student per term
- Cannot print/save incomplete report cards
- One report card per student per term

### Grading Scale:
| Score | Grade | Remark |
|-------|-------|--------|
| 90-100 | A | Excellent |
| 80-89 | B | Very Good |
| 70-79 | C | Good |
| 60-69 | D | Credit |
| 0-59 | F | Fail |

### Report Card Format:
```
┌────────────────────────────────────┐
│ SAAS ACADEMY                       │
│ STUDENT TERMINAL REPORT            │
├────────────────────────────────────┤
│ Name: John Doe                     │
│ ID: STU001                         │
│ Class: Form 1                      │
│ Term: Term 1, 2024                 │
├────────────────────────────────────┤
│ Subject      Score  Grade  Remarks │
│ Mathematics    85     B   Very Good│
│ English        92     A   Excellent│
│ Science        78     C   Good     │
│ ...                                │
├────────────────────────────────────┤
│ Overall Average: 85.00             │
│ Overall Grade: B                   │
├────────────────────────────────────┤
│ Teacher's Remarks: [...]           │
│ Principal's Remarks: [...]         │
├────────────────────────────────────┤
│ Status: Promoted to Class: Form 2  │
├────────────────────────────────────┤
│ Teacher's Signature: ✓ Signed      │
│ Principal's Signature: ✓ Signed    │
└────────────────────────────────────┘
```

## 🔄 Updating Existing Report Cards

1. Open the report card (will load saved data)
2. Modify any fields (remarks, signatures, promotion)
3. Click **"💾 Update Report Card"**
4. Changes saved to database


## 💡 Tips for School Admin/Teachers

**Best Practice Workflow**:
1. **Setup Phase** (Once):
   - Add all subjects
   - Register all students
   - Register all teachers

2. **During Term** (Ongoing):
   - Enter grades as assessments are completed
   - Can add/update grades anytime

3. **End of Term**:
   - Ensure all students have minimum 6 subject grades
   - Generate report cards
   - Fill in remarks and signatures
   - Save to database
   - Print for distribution

**Time-Saving Tips**:
- Add grades in batches (all students for one subject)
- Save report cards as drafts (without signatures)
- Complete signatures and final remarks later
- Update promotes status after final decision


## 🐛 Troubleshooting

**"Cannot print incomplete report card"**:
→ Student needs at least 6 subject grades for the term

**Subject not appearing in dropdown**:
→ Add the subject in the Subjects section first

**Cannot save report card**:
→ Ensure student has grades for that term

**Report card not loading saved data**:
→ Check that you selected the correct term


## 📞 System Flow

```
Subjects → Students → Grades → Report Cards → Print/Save
   ↓          ↓          ↓           ↓            ↓
Created → Registered → Entered → Generated → Finalized
```

---

**All features are now live and ready to use! 🚀**
