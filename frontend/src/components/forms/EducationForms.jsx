import { useState, useEffect } from "react";
import { addEducationApi, updateEducationApi } from "../../api/education.api";
import styles from "./form.module.css";
import { useToast } from "../ui/ToastContext";
export default function EducationForm({
  mode,
  initialValues,
  cvId,
  onSuccess,
  onCancel,
}) {
  const [form, setForm] = useState({
    university: initialValues?.university || "",
    country: initialValues?.country || "",
    city: initialValues?.city || "",
    degree: initialValues?.degree || "",
    major: initialValues?.major || "",
    gpa: initialValues?.gpa ?? "",
    graduationYear: initialValues?.graduationYear ?? "",
  });
  useEffect(() => {
    if (!initialValues) return;

    setForm({
      university: initialValues.university || "",
      country: initialValues.country || "",
      city: initialValues.city || "",
      degree: initialValues.degree || "",
      major: initialValues.major || "",
      gpa: initialValues.gpa ?? "",
      graduationYear: initialValues.graduationYear ?? "",
    });
  }, [initialValues]);

  const { show } = useToast();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const validate = () => {
    if (!form.university.trim()) return "University is required";
    if (!form.degree.trim()) return "Degree is required";
    if (!form.graduationYear) return "Year is required";
    return "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) return setErr(v);

    setErr("");
    setLoading(true);
    try {
      const payload = {
        ...form,
        gpa: form.gpa === "" ? null : Number(form.gpa),
        graduationYear:
          form.graduationYear === "" ? null : Number(form.graduationYear),
      };

      if (mode === "add") {
        await addEducationApi(cvId, payload);
      } else {
        await updateEducationApi(initialValues.id, payload);
      }

      show("Saved successfully", "success");
      await onSuccess();
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Save failed");
      show(e2?.response?.data?.message || "Save failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className={styles.form}>
      <div className={styles.grid}>
        <input
          name="university"
          placeholder="University"
          value={form.university}
          onChange={onChange}
        />

        <input
          name="country"
          placeholder="Country"
          value={form.country}
          onChange={onChange}
        />

        <input
          name="city"
          placeholder="City"
          value={form.city}
          onChange={onChange}
        />

        <input
          name="degree"
          placeholder="Degree"
          value={form.degree}
          onChange={onChange}
        />

        <input
          name="major"
          placeholder="Major"
          value={form.major}
          onChange={onChange}
        />

        <input
          name="gpa"
          placeholder="GPA"
          value={form.gpa}
          onChange={onChange}
        />

        <input
          name="graduationYear"
          placeholder="Year"
          value={form.graduationYear}
          onChange={onChange}
        />
      </div>

      <div className={styles.actions}>
        <button type="button" onClick={onCancel} className={styles.cancel}>
          Cancel
        </button>

        <button type="submit" className={styles.save} disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </button>
      </div>

      {err && <div className={styles.error}>{err}</div>}
    </form>
  );
}
