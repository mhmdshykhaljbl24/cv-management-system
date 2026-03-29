import { useState } from "react";
import { addProjectApi, updateProjectApi } from "../../api/project.api";
import styles from "./form.module.css";
import { useToast } from "../ui/ToastContext";
export default function ProjectForm({
  mode, // "add" | "edit"
  initialValues,
  cvId,
  onSuccess,
  onCancel,
}) {
  const [form, setForm] = useState({
    name: initialValues?.name || "",
    description: initialValues?.description || "",
    link: initialValues?.link || "",
  });

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const { show } = useToast();
  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const validate = () => {
    if (!form.name.trim()) return "Project name is required";
    return "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const v = validate();
    if (v) return setErr(v);

    setErr("");
    setLoading(true);

    try {
      const payload = { ...form };

      if (mode === "add") {
        await addProjectApi(cvId, payload);
      } else {
        await updateProjectApi(initialValues.id, payload);
      }
      show("Saved successfully", "success");
      await onSuccess?.();
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Save failed");
      show(e2?.response?.data?.message || "Save failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className={styles.form}>
      {err && <div className={styles.error}>{err}</div>}

      <div className={styles.grid}>
        <input
          name="name"
          placeholder="Project name"
          value={form.name}
          onChange={onChange}
        />

        <input
          name="link"
          placeholder="Link (optional)"
          value={form.link}
          onChange={onChange}
        />

        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={onChange}
          className={styles.textarea}
          rows={4}
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
    </form>
  );
}
