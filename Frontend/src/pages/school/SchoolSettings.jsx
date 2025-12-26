import React, { useState, useEffect } from "react";
import api from "../../api";
import "./Students.css";

const SchoolSettings = () => {
  const [profile, setProfile] = useState({
    schoolName: "",
    address: "",
    phone: "",
    email: "",
    motto: "",
    principalName: "",
    establishedYear: "",
    website: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/school/profile");
      setProfile(res.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch school profile");
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      console.log("Saving profile:", {
        hasLogo: !!profile.logo,
        logoSize: profile.logo ? profile.logo.length : 0,
      });

      const res = await api.post("/school/profile", profile);
      setProfile(res.data);
      setSuccess("School profile updated successfully!");
      setSaving(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Save error:", err);
      const errorMsg =
        err.response?.data?.msg ||
        err.response?.data ||
        err.message ||
        "Failed to update profile";
      setError(errorMsg);
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setProfile({ ...profile, [field]: value });
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB in bytes
    if (file.size > maxSize) {
      setError("Logo file size must not exceed 2MB");
      e.target.value = "";
      return;
    }

    // Check if it's an image
    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file");
      e.target.value = "";
      return;
    }

    // Convert file to base64
    const reader = new FileReader();
    reader.onload = (event) => {
      handleChange("logo", event.target.result);
      setError("");
    };
    reader.onerror = () => {
      setError("Failed to read file");
    };
    reader.readAsDataURL(file);
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="entity-page">
      <div className="page-header">
        <h1>School Settings</h1>
        <p style={{ color: "#94a3b8", marginTop: "10px" }}>
          Configure your school information. This will appear on report cards
          and official documents.
        </p>
      </div>

      {error && <div className="error-msg">{error}</div>}
      {success && <div className="success-msg">{success}</div>}

      <form
        onSubmit={handleSubmit}
        className="entity-form"
        style={{ maxWidth: "800px" }}
      >
        <h3 className="form-title">School Information</h3>

        <div className="form-row">
          <div style={{ gridColumn: "1 / -1" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#e2e8f0",
                fontWeight: "500",
              }}
            >
              School Name *
            </label>
            <input
              type="text"
              placeholder="Enter school name"
              value={profile.schoolName}
              onChange={(e) => handleChange("schoolName", e.target.value)}
              required
              className="form-input"
            />
          </div>
        </div>

        <div className="form-row">
          <div style={{ gridColumn: "1 / -1" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#e2e8f0",
                fontWeight: "500",
              }}
            >
              Address
            </label>
            <input
              type="text"
              placeholder="School address"
              value={profile.address}
              onChange={(e) => handleChange("address", e.target.value)}
              className="form-input"
            />
          </div>
        </div>

        <div className="form-row">
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#e2e8f0",
                fontWeight: "500",
              }}
            >
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="+233 XX XXX XXXX"
              value={profile.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              className="form-input"
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#e2e8f0",
                fontWeight: "500",
              }}
            >
              Email Address
            </label>
            <input
              type="email"
              placeholder="school@example.com"
              value={profile.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="form-input"
            />
          </div>
        </div>

        <div className="form-row">
          <div style={{ gridColumn: "1 / -1" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#e2e8f0",
                fontWeight: "500",
              }}
            >
              School Motto
            </label>
            <input
              type="text"
              placeholder="e.g., Excellence in Education"
              value={profile.motto}
              onChange={(e) => handleChange("motto", e.target.value)}
              className="form-input"
            />
          </div>
        </div>

        <div className="form-row">
          <div style={{ gridColumn: "1 / -1" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#e2e8f0",
                fontWeight: "500",
              }}
            >
              School Logo (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleLogoUpload(e)}
              className="form-input"
              style={{ padding: "8px" }}
            />
            <p
              style={{
                fontSize: "0.85rem",
                color: "#94a3b8",
                marginTop: "4px",
              }}
            >
              Max file size: 2MB. Recommended size: 100x100px
            </p>
            {profile.logo && (
              <div style={{ marginTop: "12px" }}>
                <div
                  style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#0f172a",
                  }}
                >
                  <img
                    src={profile.logo}
                    alt="School Logo"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleChange("logo", "")}
                  style={{
                    marginLeft: "12px",
                    padding: "6px 12px",
                    background: "#ef4444",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                  }}
                >
                  Remove Logo
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="form-row">
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#e2e8f0",
                fontWeight: "500",
              }}
            >
              Principal's Name
            </label>
            <input
              type="text"
              placeholder="Principal name"
              value={profile.principalName}
              onChange={(e) => handleChange("principalName", e.target.value)}
              className="form-input"
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#e2e8f0",
                fontWeight: "500",
              }}
            >
              Established Year
            </label>
            <input
              type="text"
              placeholder="e.g., 1990"
              value={profile.establishedYear}
              onChange={(e) => handleChange("establishedYear", e.target.value)}
              className="form-input"
            />
          </div>
        </div>

        <div className="form-row">
          <div style={{ gridColumn: "1 / -1" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#e2e8f0",
                fontWeight: "500",
              }}
            >
              Website
            </label>
            <input
              type="url"
              placeholder="https://www.yourschool.com"
              value={profile.website}
              onChange={(e) => handleChange("website", e.target.value)}
              className="form-input"
            />
          </div>
        </div>

        <button type="submit" className="btn-submit" disabled={saving}>
          {saving ? "💾 Saving..." : "💾 Save Settings"}
        </button>
      </form>

      <div
        style={{
          marginTop: "30px",
          padding: "20px",
          background: "#1e293b",
          borderRadius: "8px",
          border: "1px solid #334155",
          maxWidth: "800px",
        }}
      >
        <h3 style={{ color: "#38bdf8", marginTop: 0 }}>ℹ️ Information</h3>
        <p style={{ color: "#94a3b8", lineHeight: "1.6" }}>
          The information you provide here will be displayed on:
        </p>
        <ul style={{ color: "#94a3b8", lineHeight: "1.8" }}>
          <li>Student report cards</li>
          <li>Official school documents</li>
          <li>Communication with parents and students</li>
        </ul>
        <p style={{ color: "#94a3b8", lineHeight: "1.6", marginBottom: 0 }}>
          Make sure all information is accurate and up-to-date.
        </p>
      </div>
    </div>
  );
};

export default SchoolSettings;
