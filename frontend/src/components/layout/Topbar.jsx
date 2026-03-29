import styles from "./Topbar.module.css";
import { useAuth } from "../../auth/AuthContext";

export default function Topbar() {
  const { user, logout } = useAuth();
  return (
    <header className={styles.topbar}>
      <div className={styles.left}>Welcome</div>
      <div className={styles.right}>
        <span className={styles.email}>{user?.email}</span>
        <button className={styles.btn} onClick={logout}>
          Logout
        </button>
      </div>
    </header>
  );
}
