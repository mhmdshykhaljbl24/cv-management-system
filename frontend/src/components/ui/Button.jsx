import styles from "./Button.module.css";

export default function Button({ variant = "primary", ...props }) {
  const cls = variant === "secondary" ? styles.secondary : styles.primary;
  return <button className={cls} {...props} />;
}
