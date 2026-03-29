import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { getCvFullApi } from "../../api/cv.api";
import Button from "../../components/ui/Button";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
export default function CvPrint() {
  const { id } = useParams();
  const cvId = Number(id);

  const [cv, setCv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const pdfRef = useRef(null);

  const formatDate = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;

    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  };

  const S = useMemo(
    () => ({
      topBar: {
        width: "210mm",
        display: "flex",
        justifyContent: "flex-end",
        marginBottom: 12,
      },
      paper: {
        fontFamily: "'Inter', sans-serif",
        width: "210mm",
        height: "297mm",
        margin: "0 auto",
        background: "#ffffff",
        padding: "10mm 12mm",
        color: "#111827",
        fontSize: 12,
        lineHeight: 1.5,
        boxSizing: "border-box",
        overflow: "hidden",
      },
      pageWrap: {
        background: "#f3f4f6",
        minHeight: "100vh",
        padding: 24,

        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      },

      header: {
        paddingBottom: 14,
        borderBottom: "2px solid #e5e7eb",
        marginBottom: 18,
      },
      name: {
        margin: 0,
        fontSize: 26,
        fontWeight: 800,
        lineHeight: 1.2,
        textTransform: "capitalize",
      },
      title: {
        marginTop: 6,
        fontSize: 14,
        color: "#374151",
        fontWeight: 600,
      },
      summary: {
        marginTop: 12,
        fontSize: 12,
        color: "#374151",
      },
      contactRow: {
        marginTop: 10,
        fontSize: 11,
        color: "#4b5563",
        display: "flex",
        flexWrap: "wrap",
        gap: 10,
      },

      body: {
        display: "grid",
        gridTemplateColumns: "0.9fr 1.5fr",
        gap: 22,
      },

      section: {
        marginBottom: 12,
      },
      sectionTitle: {
        margin: "0 0 10px",
        fontSize: 13,
        letterSpacing: 1,
        textTransform: "uppercase",
        color: "#111827",
        fontWeight: 800,
        borderBottom: "1px solid #e5e7eb",
        paddingBottom: 6,
      },

      item: {
        marginBottom: 12,
      },
      itemTop: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 10,
      },
      itemTitle: {
        fontWeight: 700,
        fontSize: 12.5,
        color: "#111827",
      },
      itemSub: {
        marginTop: 2,
        fontSize: 11,
        color: "#4b5563",
      },
      itemText: {
        marginTop: 6,
        fontSize: 11.5,
        color: "#374151",
      },
      date: {
        fontSize: 11,
        color: "#6b7280",
        whiteSpace: "nowrap",
      },
      skillsWrap: {
        display: "flex",
        alignItems: "center",
        paddingBottom: 6,
        borderBottom: "1px solid #f3f4f6",
      },

      skillName: {
        flex: 1,
        fontSize: 11.5,
      },

      skillValue: {
        width: 40,
        textAlign: "right",
        fontSize: 11,
        fontWeight: 600,
      },
      pill: {
        display: "inline-block",
        padding: "4px 10px",
        borderRadius: 999,
        background: "#f3f4f6",
        border: "1px solid #e5e7eb",
        fontSize: 11,
        fontWeight: 500,
        color: "#1f2937",
      },

      muted: {
        color: "#9ca3af",
        fontSize: 11.5,
      },

      divider: {
        border: "none",
        borderTop: "1px solid #f3f4f6",
        margin: "10px 0 0",
      },
    }),
    [],
  );

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap";
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `  
      @page {
        size: A4;
        margin: 0;
      }

      @media print {
        html, body {
          background: white !important;
        }

        .no-print {
          display: none !important;
        }

        .paper {
          box-shadow: none !important;
          border-radius: 0 !important;
          margin: 0  !important;
          width: 210mm !important;
          height: 297mm !important;
          overflow:hidden !important;
                   
        }
      }
    ;`;
    document.head.appendChild(style);

    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErr("");

      try {
        const res = await getCvFullApi(cvId);
        setCv(res.data);
      } catch (e) {
        setErr(e?.response?.data?.message || "Failed to load CV");
      } finally {
        setLoading(false);
      }
    };

    if (!Number.isNaN(cvId)) {
      load();
    } else {
      setErr("Invalid CV id");
      setLoading(false);
    }
  }, [cvId]);
  const exportPdf = async () => {
    const element = pdfRef.current;
    if (!element) return;

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/jpeg", 1.0);

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = 210;
    const pageHeight = 297;

    pdf.addImage(imgData, "JPEG", 0, 0, pageWidth, pageHeight);
    pdf.save("cv.pdf");
  };
  if (loading) return <div className="container">Loading...</div>;
  if (err) return <div className="container">{err}</div>;
  if (!cv) return <div className="container">CV not found</div>;

  const fullName = cv.fullName || cv.name || cv.title || "My CV";
  const jobTitle = cv.jobTitle || cv.subtitle || "";
  const summary = cv.summary || "";

  const email = cv.email || "";
  const phone = cv.phone || "";
  const city = cv.city || "";
  const country = cv.country || "";
  const github = cv.github || "";
  const linkedin = cv.linkedin || "";

  const educations = cv.educations || [];
  const experiences = cv.experiences || [];
  const projects = cv.projects || [];
  const skills = cv.skills || [];

  return (
    <div style={S.pageWrap}>
      <div className="no-print" style={S.topBar}>
        <Button onClick={exportPdf}>Download PDF</Button>
      </div>
      <div ref={pdfRef} className="paper" style={S.paper}>
        <div style={S.header}>
          <h1 style={S.name}>{fullName}</h1>

          {jobTitle ? <div style={S.title}>{jobTitle}</div> : null}

          {summary ? <div style={S.summary}>{summary}</div> : null}

          {(email || phone || city || country || github || linkedin) && (
            <div style={S.contactRow}>
              {email ? <span>{email}</span> : null}
              {phone ? <span>{phone}</span> : null}
              {city || country ? (
                <span>
                  {city}
                  {city && country ? ", " : ""}
                  {country}
                </span>
              ) : null}
              {github ? <span>{github}</span> : null}
              {linkedin ? <span>{linkedin}</span> : null}
            </div>
          )}
        </div>
        <div style={S.body}>
          <div style={S.section}>
            <div style={S.sectionTitle}>Education</div>
            {educations.length ? (
              educations.map((e, i) => (
                <div key={e.id || i} style={S.item}>
                  <div style={S.educationTop}>
                    <div style={S.itemTitle}>{e.university || "—"}</div>
                  </div>

                  {(e.degree || e.major) && (
                    <div style={S.itemSub}>
                      {e.degree || ""}
                      {e.degree && e.major ? " — " : ""}
                      {e.major || ""}
                    </div>
                  )}
                  {e.gpa != null ? (
                    <div style={S.date}>GPA: {e.gpa}</div>
                  ) : null}
                  {(e.year || e.graduationYear) && (
                    <div style={S.itemSub}>
                      year: {e.year || e.graduationYear}
                    </div>
                  )}
                  {e.age != null && (
                    <div style={S.itemSub}>{`Age: ${e.age}`}</div>
                  )}
                  {(e.city || e.country) && (
                    <div style={S.itemSub}>
                      {e.city || ""}
                      {e.city && e.country ? ", " : ""}
                      {e.country || ""}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div style={S.muted}>—</div>
            )}
          </div>
          <div style={S.section}>
            <div style={S.sectionTitle}>Experience</div>
            {experiences.length ? (
              experiences.map((x, i) => (
                <div key={x.id || i} style={S.item}>
                  <div style={S.itemTop}>
                    <div>
                      <div style={S.itemTitle}>
                        {x.position || "—"}
                        {x.company ? `— ${x.company}` : ""}
                      </div>

                      {(x.city || x.country) && (
                        <div style={S.itemSub}>
                          {x.city || ""}
                          {x.city && x.country ? ", " : ""}
                          {x.country || ""}
                        </div>
                      )}
                    </div>

                    <div style={S.date}>
                      {formatDate(x.startDate)}
                      {x.startDate || x.endDate ? " — " : ""}
                      {x.endDate ? formatDate(x.endDate) : "Present"}
                    </div>
                  </div>
                  {x.description ? (
                    <div style={S.itemText}>{x.description}</div>
                  ) : null}
                </div>
              ))
            ) : (
              <div style={S.muted}>—</div>
            )}
          </div>
          <div style={S.section}>
            <div style={S.sectionTitle}>Skills</div>
            {skills.length ? (
              <div style={S.skillsList}>
                {skills.map((s, i) => (
                  <div key={s?.id || i} style={S.skillsWrap}>
                    <span style={S.skillName}>
                      {typeof s === "string" ? s : s?.name || "Skill"}
                    </span>
                    <span style={S.skillValue}>
                      {typeof s === "object" && s?.level != null
                        ? `${s.level}%`
                        : "   "}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={S.muted}>—</div>
            )}
          </div>
          <div style={S.section}>
            <div style={S.sectionTitle}>Projects</div>
            {projects.length ? (
              projects.map((p, i) => (
                <div key={p.id || i} style={S.item}>
                  <div style={S.itemTitle}>{p.name || "—"}</div>
                  {p.link ? <div style={S.itemSub}>{p.link}</div> : null}
                  {p.description ? (
                    <div style={S.itemText}>{p.description}</div>
                  ) : null}
                </div>
              ))
            ) : (
              <div style={S.muted}>—</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
