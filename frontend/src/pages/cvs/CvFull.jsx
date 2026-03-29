import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getCvFullApi } from "../../api/cv.api";
import { deleteEducationApi } from "../../api/education.api";
import { deleteExperienceApi } from "../../api/experience.api";
import { deleteProjectApi } from "../../api/project.api";
import { deleteSkillApi } from "../../api/skill.api";
import Modal from "../../components/ui/Model";
import styles from "./CvFull.module.css";
import SectionManager from "../../components/sections/SectionManager";
import EducationForm from "../../components/forms/EducationForms";
import ExperienceForm from "../../components/forms/ExperienceForm";
import ProjectForm from "../../components/forms/ProjectForm";
import SkillForm from "../../components/forms/SkillForm";
import { useToast } from "../../components/ui/ToastContext";
import Button from "../../components/ui/Button";
const TABS = ["Education", "Experience", "Projects", "Skills"];
const deleteApiByTab = {
  Education: deleteEducationApi,
  Experience: deleteExperienceApi,
  Projects: deleteProjectApi,
  Skills: deleteSkillApi,
};

export default function CvFull() {
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState("add"); // "add" | "edit"
  const [selectedItem, setSelectedItem] = useState(null);
  const { show } = useToast();
  const exportFullPdf = () => {
    window.open(`/cvs/${cvId}/print`, "_blank");
  };
  const openAdd = () => {
    setMode("add");
    setSelectedItem(null);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setMode("edit");
    setSelectedItem(item);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);
  const { id } = useParams();
  const cvId = Number(id);

  const [cv, setCv] = useState(null);
  const [tab, setTab] = useState("Education");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const section = useMemo(() => {
    if (!cv) return [];
    if (tab === "Education") return cv.educations || [];
    if (tab === "Experience") return cv.experiences || [];
    if (tab === "Projects") return cv.projects || [];
    return cv.skills || [];
  }, [cv, tab]);
  const loadCvFull = async () => {
    const res = await getCvFullApi(cvId);
    setCv(res.data);
  };

  useEffect(() => {
    const load = async () => {
      setErr("");
      setLoading(true);
      try {
        const res = await getCvFullApi(cvId);
        setCv(res.data);
      } catch (e) {
        setErr(e?.response?.data?.message || "Failed to load CV");
      } finally {
        setLoading(false);
      }
    };

    if (!Number.isNaN(cvId)) load();
    else {
      setErr("Invalid CV id");
      setLoading(false);
    }
  }, [cvId]);

  if (loading) return <div className="container">Loading...</div>;
  if (err) return <div className="container">{err}</div>;
  if (!cv) return <div className="container">CV not found</div>;

  return (
    <div className="container">
      <div className={styles.header}>
        <div className={styles.titleBlock}>
          <h2>My CV</h2>
          <div className={styles.subtitle}>Backend developer</div>
        </div>

        <Button onClick={exportFullPdf}>Export Full PDF</Button>
      </div>

      <div className={styles.tabs}>
        {TABS.map((t) => (
          <button
            key={t}
            className={t === tab ? styles.tabActive : styles.tab}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <SectionManager
        title={tab}
        items={section}
        onAdd={openAdd}
        onEdit={openEdit}
        onDelete={async (id) => {
          try {
            await deleteApiByTab[tab](id);
            await loadCvFull();
            show("Deleted successfully", "success");
          } catch (e) {
            show(e?.response?.data?.message || "Delete failed", "error");
          }
        }}
        renderItem={(item) => (
          <div>
            <strong>
              {item.university || item.company || item.name || item.projectName}
            </strong>
          </div>
        )}
      />
      <Modal
        open={modalOpen}
        title={mode === "add" ? `Add ${tab}` : `Edit ${tab}`}
        onClose={closeModal}
      >
        {tab === "Education" && (
          <EducationForm
            mode={mode}
            initialValues={selectedItem}
            cvId={cvId}
            onSuccess={async () => {
              await loadCvFull();
              closeModal();
            }}
            onCancel={closeModal}
          />
        )}
        {tab === "Experience" && (
          <ExperienceForm
            mode={mode}
            initialValues={selectedItem}
            cvId={cvId}
            onCancel={closeModal}
            onSuccess={async () => {
              await loadCvFull();
              closeModal();
            }}
          />
        )}
        {tab === "Projects" && (
          <ProjectForm
            mode={mode}
            initialValues={selectedItem}
            cvId={cvId}
            onSuccess={async () => {
              await loadCvFull();
              closeModal();
            }}
            onCancel={closeModal}
          />
        )}

        {tab === "Skills" && (
          <SkillForm
            mode={mode}
            initialValues={selectedItem}
            cvId={cvId}
            onSuccess={async () => {
              await loadCvFull();
              closeModal();
            }}
            onCancel={closeModal}
          />
        )}
      </Modal>
    </div>
  );
}
