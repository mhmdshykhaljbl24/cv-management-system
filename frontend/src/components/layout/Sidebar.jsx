import { NavLink } from "react-router-dom";
import styles from "./Sidebar.module.css";

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>CV Manager</div>

      <nav className={styles.nav}>
        <NavLink
          to="/dashboard"
          className={({ isActive }) => (isActive ? styles.active : styles.link)}
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/cvs"
          className={({ isActive }) => (isActive ? styles.active : styles.link)}
        >
          My CVs
        </NavLink>
      </nav>
    </aside>
  );
}
