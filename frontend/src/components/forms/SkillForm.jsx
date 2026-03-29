import { useState, useEffect } from "react";
import { addSkillApi } from "../../api/skill.api";
import styles from "./form.module.css";
import { useToast } from "../ui/ToastContext";
const emptyRow = { name: "", level: "" };

export default function SkillForm({
  cvId,
  onDone,
  onCancel,
  onSuccess,
  mode,
  initialValues,
}) {
  const [rows, setRows] = useState([{ ...emptyRow }]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const { show } = useToast();
  const updateRow = (idx, key, value) => {
    setRows((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, [key]: value } : r)),
    );
  };
  const addRow = () => setRows((prev) => [...prev, { ...emptyRow }]);
  const removeRow = (idx) =>
    setRows((prev) => prev.filter((_, i) => i !== idx));
  useEffect(() => {
    if (mode === "edit" && initialValues) {
      setRows([
        {
          name: initialValues.name ?? "",
          // مهم: نخلي 0 يبين (لأنه قيمة صحيحة)
          level: initialValues.level ?? "",
        },
      ]);
    } else {
      setRows([{ ...emptyRow }]);
    }
  }, [mode, initialValues]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const cleaned = rows
        .map((r) => ({
          name: (r.name || "").trim(),
          level: r.level === "" ? undefined : Number(r.level),
        }))
        .filter((r) => r.name.length > 0);

      if (cleaned.length === 0) {
        setErr("Add at least one skill");
        setLoading(false);
        return;
      }

      for (const r of cleaned) {
        if (r.name.length < 2)
          throw new Error("Skill name must be at least 2 chars");
        if (r.level !== undefined) {
          if (!Number.isFinite(r.level) || r.level < 0 || r.level > 100) {
            throw new Error("Level must be between 0 and 100");
          }
        }
      }
      await Promise.all(cleaned.map((r) => addSkillApi(cvId, r)));
      show("Saved successfully", "success");
      await onSuccess?.();
      setRows([emptyRow]);
      await onDone?.();
    } catch (e2) {
      setErr(
        e2?.response?.data?.message || e2?.message || "Failed to add skills",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {err && <div className={styles.error}>{err}</div>}

      {rows.map((r, idx) => (
        <div key={idx} className={styles.grid}>
          <input
            placeholder="Skill (e.g. React)"
            value={r.name}
            onChange={(e) => updateRow(idx, "name", e.target.value)}
          />
          <input
            type="number"
            min="0"
            max="100"
            placeholder="Level"
            value={r.level}
            onChange={(e) => updateRow(idx, "level", e.target.value)}
          />

          {rows.length > 1 && (
            <button
              type="button"
              className={styles.cancel}
              onClick={() => removeRow(idx)}
            >
              Remove
            </button>
          )}
        </div>
      ))}

      <div className={styles.actions}>
        <button type="button" onClick={addRow} className={styles.save}>
          + Add another
        </button>
        <button disabled={loading} type="submit" className={styles.save}>
          {loading ? "Saving..." : "Save all"}
        </button>
        <button type="button" onClick={onCancel} className={styles.cancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
