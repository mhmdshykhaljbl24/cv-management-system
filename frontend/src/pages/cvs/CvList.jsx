import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { createCvApi, deleteCvApi, listCvsApi } from "../../api/cv.api";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import styles from "./CvList.module.css";

export default function CvList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [fullName, setfullname] = useState("");
  const nav = useNavigate();

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await listCvsApi();
      setItems(res.data);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load CVs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onCreate = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      await createCvApi({ title, summary, fullName });
      setTitle("");
      setSummary("");
      setfullname("");
      await load();
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Create failed");
    }
  };

  const onDelete = async (id) => {
    if (!confirm("Delete this CV?")) return;
    setErr("");
    try {
      await deleteCvApi(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="container">
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>My CVs</h2>
          <p className={styles.subtitle}>Create and manage your CVs.</p>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Create new CV</h3>
          {err && <div className={styles.error}>{err}</div>}
          <form onSubmit={onCreate} className={styles.form}>
            <label className={styles.label}>
              Name
              <Input
                placeholder="Full name"
                value={fullName}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^[A-Za-z\u0600-\u06FF\s]*$/.test(value)) {
                    setfullname(value);
                  }
                }}
              />
            </label>
            <label className={styles.label}>
              Title
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My CV"
              />
            </label>

            <label className={styles.label}>
              Summary
              <Input
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Backend developer..."
              />
            </label>

            <Button type="submit">Create</Button>
          </form>
        </div>

        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Your CVs</h3>

          {loading ? (
            <div className={styles.muted}>Loading...</div>
          ) : items.length === 0 ? (
            <div className={styles.muted}>No CVs yet.</div>
          ) : (
            <div className={styles.list}>
              {items.map((cv) => (
                <div key={cv.id} className={styles.item}>
                  <div>
                    <div className={styles.itemTitle}>{cv.title}</div>
                    <div className={styles.itemSub}>{cv.summary}</div>
                  </div>

                  <div className={styles.actions}>
                    <Button
                      variant="secondary"
                      onClick={() => nav(`/cvs/${cv.id}/full`)}
                    >
                      open
                    </Button>
                    <Button variant="secondary" onClick={() => onDelete(cv.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
