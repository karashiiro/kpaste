import { useAuth } from "../auth/useAuth";
import styles from "./Header.module.css";

interface HeaderProps {
  onLoginClick: () => void;
}

export function Header({ onLoginClick }: HeaderProps) {
  const { isAuthenticated, session, logout, isLoading } = useAuth();

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <h1 className={styles.title}>
            📝 <span className={styles.titleText}>KPaste</span>
          </h1>
          <p className={styles.subtitle}>AT Protocol Pastebin</p>
        </div>

        <div className={styles.authSection}>
          {isAuthenticated && session ? (
            <div className={styles.userInfo}>
              <div className={styles.userDetails}>
                <span className={styles.userHandle}>@{session.handle}</span>
                <span className={styles.userService}>
                  {session.endpoint.url}
                </span>
              </div>
              <button
                onClick={logout}
                disabled={isLoading}
                className={styles.logoutButton}
              >
                {isLoading ? "🔄" : "👋"} Logout
              </button>
            </div>
          ) : (
            <button onClick={onLoginClick} className={styles.loginButton}>
              🚀 Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
