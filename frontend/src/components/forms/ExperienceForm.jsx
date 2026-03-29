import { useEffect, useMemo, useState } from "react";
import styles from "./form.module.css";
import {
  addExperienceApi,
  updateExperienceApi,
} from "../../api/experience.api";
import { useToast } from "../ui/ToastContext";
export default function ExperienceForm({
  mode = "add", // "add" | "edit"
  initialValues = null, // item أو null
  cvId,
  onSuccess,
  onCancel,
}) {
  const initialForm = useMemo(
    () => ({
      company: initialValues?.company ?? "",
      country: initialValues?.country ?? "",
      city: initialValues?.city ?? "",
      position: initialValues?.position ?? "",
      startDate: (initialValues?.startDate ?? "").slice(0, 10), // YYYY-MM-DD
      endDate: initialValues?.endDate ? initialValues.endDate.slice(0, 10) : "",
    }),
    [initialValues],
  );
  const { show } = useToast();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    setForm(initialForm);
    setErr("");
  }, [initialForm]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const validate = () => {
    if (!form.company.trim()) return "Company is required";
    if (!form.position.trim()) return "Position is required";
    if (!form.startDate) return "Start date is required";
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
        company: form.company.trim(),
        country: form.country.trim(),
        city: form.city.trim(),
        position: form.position.trim(),
        startDate: new Date(form.startDate).toISOString(),
        endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
      };

      if (mode === "add") {
        await addExperienceApi(cvId, payload);
      } else {
        await updateExperienceApi(initialValues.id, payload);
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
          name="company"
          placeholder="Company"
          value={form.company}
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
          name="position"
          placeholder="Position"
          value={form.position}
          onChange={onChange}
        />

        <input
          name="startDate"
          type="date"
          value={form.startDate}
          onChange={onChange}
        />
        <input
          name="endDate"
          type="date"
          value={form.endDate}
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
