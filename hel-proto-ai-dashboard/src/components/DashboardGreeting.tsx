import type { MockUser } from '../types';
import styles from './DashboardGreeting.module.css';

// ✅ HDS Core: uses design tokens only – Suoraan Drupalissa

interface DashboardGreetingProps {
  user: MockUser;
}

export function DashboardGreeting({ user }: DashboardGreetingProps) {
  const hour = new Date().getHours();
  const greeting =
    hour < 10 ? 'Hyvää huomenta' : hour < 17 ? 'Hei' : 'Hyvää iltaa';

  return (
    <section className={styles.greeting} aria-label="Tervehdys">
      <h1 className={styles.greetingTitle}>
        {greeting}, {user.firstName}
      </h1>
      <p className={styles.greetingMeta}>
        Osio: {user.section}
      </p>
    </section>
  );
}
