import styles from "./Header.module.css";
import Image from "next/image";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <p>Optimal Route Finding</p>
        {/* <div className={styles.dropdown}>📍 Situation Map ▾</div> */}
      </div>
      <div className={styles.right}>
        <Image
          src="/images/icn_noti.svg"
          alt="notification icon"
          width={20}
          height={20}
        />
        <Image
          src="/images/icn_my_page.svg"
          alt="mypage icon"
          width={32}
          height={32}
        />
        {/* <div className={styles.icon}>🔔</div> */}
        {/* <div className={styles.icon}>👤</div> */}
      </div>
    </header>
  );
}