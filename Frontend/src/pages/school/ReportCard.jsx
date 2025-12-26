import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../../api";
import "./ReportCard.css";

const ReportCard = () => {
  const { studentId } = useParams();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [availableTerms, setAvailableTerms] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState("");
  const [schoolProfile, setSchoolProfile] = useState(null);

  // Editable fields for the report card
  const [promotionStatus, setPromotionStatus] = useState("Promoted");
  const [nextClass, setNextClass] = useState("");
  const [teacherRemarks, setTeacherRemarks] = useState("");
  const [principalRemarks, setPrincipalRemarks] = useState("");
  const [teacherSignature, setTeacherSignature] = useState(false);
  const [principalSignature, setPrincipalSignature] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    fetchAvailableTerms();
    fetchSchoolProfile();
  }, [studentId]);

  const fetchSchoolProfile = async () => {
    try {
      const res = await api.get("/school/profile");
      setSchoolProfile(res.data);
    } catch (err) {
      console.error("Failed to fetch school profile");
      // Use default values if fetch fails
      setSchoolProfile({
        schoolName: "SAAS ACADEMY",
        address: "123 Education Lane, Knowledge City, GH",
        phone: "+233 55 123 4567",
        email: "info@saasacademy.com",
      });
    }
  };

  const fetchAvailableTerms = async () => {
    try {
      const res = await api.get("/school/grades");
      const studentGrades = res.data.filter((g) => g.studentId === studentId);
      const terms = [...new Set(studentGrades.map((g) => g.term))];
      setAvailableTerms(terms);
      if (terms.length > 0) {
        setSelectedTerm(terms[0]);
        fetchReportCard(terms[0]);
      } else {
        setLoading(false);
        setError("No grades found for this student");
      }
    } catch (err) {
      setError("Failed to fetch terms");
      setLoading(false);
    }
  };

  const fetchReportCard = async (term) => {
    try {
      setLoading(true);
      const res = await api.get(`/school/report-card/${studentId}/${term}`);
      setReportData(res.data);

      // Load saved data if available
      setTeacherRemarks(res.data.teacherRemarks || "");
      setPrincipalRemarks(res.data.principalRemarks || "");
      setTeacherSignature(res.data.teacherSignature || false);
      setPrincipalSignature(res.data.principalSignature || false);
      setPromotionStatus(res.data.promotionStatus || "Promoted");
      setNextClass(res.data.nextClass || "");
      setIsSaved(res.data.isSaved || false);

      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to fetch report card");
      setLoading(false);
    }
  };

  const handleTermChange = (e) => {
    const term = e.target.value;
    setSelectedTerm(term);
    fetchReportCard(term);
  };

  const handleSaveReportCard = async () => {
    try {
      setSaving(true);
      setError("");
      setSaveSuccess("");

      const reportCardData = {
        studentId: reportData.student.id,
        studentName: reportData.student.name,
        term: selectedTerm,
        teacherRemarks,
        principalRemarks,
        teacherSignature,
        principalSignature,
        promotionStatus,
        nextClass,
      };

      if (isSaved) {
        // Update existing report card
        await api.put(
          `/school/report-card/${studentId}/${selectedTerm}`,
          reportCardData
        );
        setSaveSuccess("Report card updated successfully!");
      } else {
        // Create new report card
        await api.post("/school/report-card", reportCardData);
        setSaveSuccess("Report card saved successfully!");
        setIsSaved(true);
      }

      setSaving(false);
      setTimeout(() => setSaveSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to save report card");
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error && !reportData) return <div className="error-msg">{error}</div>;

  // Validation: Check if student has at least 6 subjects
  const subjectCount = reportData?.grades?.length || 0;
  const isComplete = subjectCount >= 6;

  return (
    <div className="report-card-page">
      <div className="no-print controls">
        <select value={selectedTerm} onChange={handleTermChange}>
          {availableTerms.map((term) => (
            <option key={term} value={term}>
              {term}
            </option>
          ))}
        </select>
        <button
          onClick={handleSaveReportCard}
          className="btn-save"
          disabled={!isComplete || saving}
          title={
            !isComplete
              ? "Cannot save incomplete report card"
              : "Save Report Card"
          }
        >
          {saving
            ? "💾 Saving..."
            : `💾 ${isSaved ? "Update" : "Save"} Report Card`}
        </button>
        <button
          onClick={handlePrint}
          className="btn-print"
          disabled={!isComplete}
          title={
            !isComplete
              ? "Cannot print incomplete report card"
              : "Print Report Card"
          }
        >
          🖨️ Print Report Card
        </button>
      </div>

      {saveSuccess && <div className="success-msg no-print">{saveSuccess}</div>}
      {error && <div className="error-msg no-print">{error}</div>}

      {!isComplete && (
        <div className="validation-warning no-print">
          <h3>⚠️ Incomplete Report Card</h3>
          <p>
            This student has only completed <strong>{subjectCount}</strong>{" "}
            subjects. A minimum of <strong>6 subjects</strong> is required to
            generate a valid report card.
          </p>
          <p>Please add more grades in the Grades section.</p>
        </div>
      )}

      {reportData && (
        <div className={`report-card ${!isComplete ? "incomplete-blur" : ""}`}>
          {/* Header Section */}
          <div className="report-header">
            <div className="school-logo">
              {schoolProfile?.logo ? (
                <img
                  src={schoolProfile.logo}
                  alt="School Logo"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    borderRadius: "50%",
                  }}
                />
              ) : null}
            </div>
            <div className="school-details">
              <h1 className="school-name">
                {schoolProfile?.schoolName || "SAAS ACADEMY"}
              </h1>
              <p className="school-address">
                {schoolProfile?.address ||
                  "123 Education Lane, Knowledge City, GH"}
              </p>
              <p className="school-contact">
                {schoolProfile?.phone && `Tel: ${schoolProfile.phone}`}
                {schoolProfile?.phone && schoolProfile?.email && " | "}
                {schoolProfile?.email && `Email: ${schoolProfile.email}`}
              </p>
              {schoolProfile?.motto && (
                <p
                  className="school-motto"
                  style={{ fontStyle: "italic", marginTop: "5px" }}
                >
                  {schoolProfile.motto}
                </p>
              )}
              <h2 className="report-title">STUDENT TERMINAL REPORT</h2>
            </div>
          </div>

          {/* Student Details */}
          <div className="student-details-grid">
            <div className="detail-item">
              <span className="label">Name:</span>
              <span className="value">{reportData.student.name}</span>
            </div>
            <div className="detail-item">
              <span className="label">ID:</span>
              <span className="value">{reportData.student.studentId}</span>
            </div>
            <div className="detail-item">
              <span className="label">Class:</span>
              <span className="value">{reportData.student.class}</span>
            </div>
            <div className="detail-item">
              <span className="label">Term:</span>
              <span className="value">{reportData.term}</span>
            </div>
            <div className="detail-item">
              <span className="label">No. on Roll:</span>
              <span className="value">--</span>{" "}
              {/* Placeholder as backend doesn't send this yet */}
            </div>
            <div className="detail-item">
              <span className="label">Date:</span>
              <span className="value">{new Date().toLocaleDateString()}</span>
            </div>
          </div>

          {/* Grades Table */}
          <table className="grades-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Score (100%)</th>
                <th>Grade</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {reportData.grades.map((grade, index) => (
                <tr key={index}>
                  <td className="subject-cell">{grade.subject}</td>
                  <td className="text-center">{grade.score}</td>
                  <td className={`text-center grade-${grade.grade}`}>
                    {grade.grade}
                  </td>
                  <td className="text-center">{getGradeRemark(grade.grade)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="summary-row">
                <td colSpan="1">
                  <strong>Overall Average</strong>
                </td>
                <td className="text-center">
                  <strong>{reportData.average}</strong>
                </td>
                <td className="text-center">
                  <strong>{reportData.overallGrade}</strong>
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>

          {/* Performance Analysis & Remarks */}
          <div className="report-footer-section">
            <div className="remarks-section">
              <div className="input-group">
                <label>Class Teacher's Remarks:</label>
                <textarea
                  className="editable-field"
                  value={teacherRemarks}
                  onChange={(e) => setTeacherRemarks(e.target.value)}
                  placeholder="Enter remarks here..."
                  rows="2"
                />
              </div>
              <div className="input-group">
                <label>Principal's Remarks:</label>
                <textarea
                  className="editable-field"
                  value={principalRemarks}
                  onChange={(e) => setPrincipalRemarks(e.target.value)}
                  placeholder="Enter remarks here..."
                  rows="2"
                />
              </div>
            </div>

            <div className="status-section">
              <h3>Final Decision</h3>
              <div className="status-options no-print">
                <label>
                  <input
                    type="radio"
                    name="status"
                    value="Promoted"
                    checked={promotionStatus === "Promoted"}
                    onChange={(e) => setPromotionStatus(e.target.value)}
                  />{" "}
                  Promoted
                </label>
                <label>
                  <input
                    type="radio"
                    name="status"
                    value="Demoted"
                    checked={promotionStatus === "Demoted"}
                    onChange={(e) => setPromotionStatus(e.target.value)}
                  />{" "}
                  Demoted
                </label>
                <label>
                  <input
                    type="radio"
                    name="status"
                    value="Repeated"
                    checked={promotionStatus === "Repeated"}
                    onChange={(e) => setPromotionStatus(e.target.value)}
                  />{" "}
                  Repeated
                </label>
                <label>
                  <input
                    type="radio"
                    name="status"
                    value="Withdrawn"
                    checked={promotionStatus === "Withdrawn"}
                    onChange={(e) => setPromotionStatus(e.target.value)}
                  />{" "}
                  Withdrawn
                </label>
              </div>

              <div className="status-display">
                <p>
                  <strong>Status:</strong>{" "}
                  <span className="status-value">{promotionStatus}</span> to
                  Class:
                  <input
                    type="text"
                    className="inline-input"
                    value={nextClass}
                    onChange={(e) => setNextClass(e.target.value)}
                    placeholder="Next Class"
                  />
                </p>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="signatures">
            <div className="signature-box">
              <div className="signature-checkbox no-print">
                <label>
                  <input
                    type="checkbox"
                    checked={teacherSignature}
                    onChange={(e) => setTeacherSignature(e.target.checked)}
                  />
                  <span> Teacher has signed</span>
                </label>
              </div>
              <div className="line">{teacherSignature ? "✓ Signed" : ""}</div>
              <p>Class Teacher's Signature</p>
            </div>
            <div className="signature-box">
              <div className="signature-checkbox no-print">
                <label>
                  <input
                    type="checkbox"
                    checked={principalSignature}
                    onChange={(e) => setPrincipalSignature(e.target.checked)}
                  />
                  <span> Principal has signed</span>
                </label>
              </div>
              <div className="line">{principalSignature ? "✓ Signed" : ""}</div>
              <p>Principal's Signature</p>
            </div>
          </div>

          <div className="footer-note">
            <p>
              <em>This report is computer generated and requires no seal.</em>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper for grade remarks
const getGradeRemark = (grade) => {
  if (grade === "A") return "Excellent";
  if (grade === "B") return "Very Good";
  if (grade === "C") return "Good";
  if (grade === "D") return "Credit / Pass";
  if (grade === "E") return "Weak";
  if (grade === "F") return "Fail";
  return "-";
};

export default ReportCard;
