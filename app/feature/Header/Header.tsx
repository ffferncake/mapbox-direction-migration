import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <p>Optimal Route Finding</p>
        {/* <div className={styles.dropdown}>📍 Situation Map ▾</div> */}
      </div>
      <div className={styles.right}>
        <div className={styles.icon}>🔔</div>
        <div className={styles.icon}>👤</div>
      </div>
    </header>
  );
}