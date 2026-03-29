import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import styles from "./AppLayout.module.css";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <div className={styles.shell}>
      <Sidebar />
      <div className={styles.main}>
        <Topbar />
        <div className={styles.content}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
