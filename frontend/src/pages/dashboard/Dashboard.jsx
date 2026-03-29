import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Dashboard.module.css";
import Button from "../../components/ui/Button";
import { getDashboardSummaryApi, getMyCvsApi } from "../../api/dashboard.api";
//import { createCvApi } from "../../api/cv.api";
export default function Dashboard() {
  const navigate = useNavigate();

  const handleCreate = async () => {
    try {
      /* await createCvApi({
        fullName: "name",
        title: "New CV",
        summary: "Edit this summary",
      });*/

      navigate(`/cvs`);
    } catch (err) {
      console.error(err);
    }
  };
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [summary, setSummary] = useState(null);
  const [cvs, setCvs] = useState([]);

  const computed = useMemo(() => {
    const count = cvs.length;

    const last = [...cvs].sort((a, b) => {
      const da = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const db = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return db - da;
    })[0];

    const lastTitle = last?.title || "—";
    const lastUpdated = last?.updatedAt || last?.createdAt || null;

    return { count, last, lastTitle, lastUpdated };
  }, [cvs]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErr("");

      try {
        try {
          const s = await getDashboardSummaryApi();
          setSummary(s.data);
        } catch {
          setSummary(null);
        }

        const res = await getMyCvsApi();
        setCvs(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        setErr(e?.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const goEditLatest = () => {
    const id = summary?.latestCvId || computed.last?.id;
    if (id) navigate(`/cvs/${id}/full`);
  };

  const exportLatestPdf = () => {
    const id = summary?.latestCvId || computed.last?.id;
    if (id) window.open(`/cvs/${id}/print`, "_blank");
  };

  if (loading) return <div className={styles.page}>Loading...</div>;
  if (err) return <div className={styles.page}>{err}</div>;

  const cvCount = summary?.cvCount ?? computed.count;
  const lastTitle = summary?.latestTitle ?? computed.lastTitle;
  const completion = summary?.completion ?? null;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Dashboard</h2>
          <p className={styles.subtitle}>
            Manage your CVs and quickly jump to editing.
          </p>
        </div>

        <div className={styles.headerActions}>
          <Button onClick={handleCreate}>Create CV</Button>
          <Button
            onClick={goEditLatest}
            disabled={!computed.last && !summary?.latestCvId}
          >
            Edit Latest
          </Button>
          <Button
            onClick={exportLatestPdf}
            disabled={!computed.last && !summary?.latestCvId}
          >
            Export PDF
          </Button>
        </div>
      </div>

      {/* Cards */}
      <div className={styles.cards}>
        <div className={styles.card}>
          <div className={styles.cardLabel}>Total CVs</div>
          <div className={styles.cardValue}>{cvCount}</div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardLabel}>Latest CV</div>
          <div className={styles.cardValueSm}>{lastTitle}</div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardLabel}>Completion</div>
          <div className={styles.cardValue}>
            {completion !== null && completion !== undefined
              ? `${completion}%`
              : "—"}
          </div>
          <div className={styles.cardHint}>
            (Optional) Add completion score later
          </div>
        </div>
      </div>

      {/* Recent CVs */}
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>Recent CVs</h2>
          <button className={styles.linkBtn} onClick={() => navigate("/cvs")}>
            View all
          </button>
        </div>

        {cvs.length === 0 ? (
          <div className={styles.empty}>
            No CVs yet. Create your first CV to get started.
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Updated</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {[...cvs]
                .sort((a, b) => {
                  const da = new Date(
                    a.updatedAt || a.createdAt || 0,
                  ).getTime();
                  const db = new Date(
                    b.updatedAt || b.createdAt || 0,
                  ).getTime();
                  return db - da;
                })
                .slice(0, 5)
                .map((cv) => (
                  <tr key={cv.id}>
                    <td className={styles.tdTitle}>{cv.title}</td>
                    <td className={styles.tdMuted}>
                      {cv.updatedAt
                        ? new Date(cv.updatedAt).toLocaleString()
                        : cv.createdAt
                          ? new Date(cv.createdAt).toLocaleString()
                          : "—"}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className={styles.smallBtn}
                        onClick={() => navigate(`/cvs/${cv.id}/full`)}
                      >
                        Open
                      </button>
                      <button
                        className={styles.smallBtn}
                        onClick={() =>
                          window.open(`/cvs/${cv.id}/print`, "_blank")
                        }
                      >
                        PDF
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
