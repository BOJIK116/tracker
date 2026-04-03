export default function AuthPage({
  mode,
  setMode,
  email,
  setEmail,
  password,
  setPassword,
  loading,
  error,
  onLogin,
  onRegister,
}) {
  function handleSubmit(e) {
    e.preventDefault();

    if (mode === "login") {
      onLogin();
    } else {
      onRegister();
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-topbar">
          <div className="auth-host">
            <span className="auth-dot" />
            <span>tracker@system: ~/login</span>
          </div>
        </div>

        <div className="auth-body">
          <div className="auth-heading">
            <div className="auth-path">
              <span className="brand">tracker</span>
              <span className="slash"> / </span>
              <span>{mode}</span>
              <span className="cursor" />
            </div>

            <p className="auth-subtitle">
              {mode === "login"
                ? "Sign in to continue your weekly activity tracking."
                : "Create an account to start tracking your progress."}
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="submit"
              className={loading ? "is-loading" : ""}
              disabled={loading}
            >
              {loading
                ? "Connecting..."
                : mode === "login"
                ? "Login"
                : "Create account"}
            </button>
          </form>

          {error && <div className="auth-error">{error}</div>}

          <button
            className="auth-link"
            type="button"
            onClick={() =>
              setMode(mode === "login" ? "register" : "login")
            }
          >
            {mode === "login"
              ? "No account? Register"
              : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
  function handleSubmit(e) {
  e.preventDefault();
  console.log("submit", { mode, email, password });

  if (mode === "login") {
    console.log("calling onLogin");
    onLogin();
  } else {
    console.log("calling onRegister");
    onRegister();
  }
}
}