import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <p className={styles.eyebrow}>I-Wonder</p>
        <div className={styles.intro}>
          <h1>問いから始まる、学びと挑戦のための場所。</h1>
          <p>
            まずは Next.js と Vercel で公開基盤を整えています。ここから
            I-Wonder の内容を育てていく前提の最小構成です。
          </p>
        </div>
        <div className={styles.ctas}>
          <a className={styles.primary} href="https://github.com/GouKobayashi/I-Wonder">
            GitHub
          </a>
          <a className={styles.secondary} href="https://vercel.com">
            Vercel
          </a>
        </div>
      </main>
    </div>
  );
}
