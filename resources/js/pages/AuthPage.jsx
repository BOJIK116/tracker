import React from 'react'

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
  return (
    <div className="container">
      <div className="term">
        <div className="termTop">
          <div className="badge">
            <span className="dot" />
            <span>user@host: ~/tasks</span>
          </div>

          <span className="keyBtn" style={{ cursor: 'default' }}>
            <span className="key">API</span>
            <span>offline</span>
          </span>
        </div>

        <div className="termBody">
          <div className="hTitle">
            <span>tracker</span>
            <span className="dim">/ {mode === 'login' ? 'login' : 'register'}</span>
          </div>

          <div className="hr" />

          {error ? <div className="alert">{error}</div> : null}

          <form className="form" onSubmit={mode === 'login' ? onLogin : onRegister}>
            <input
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email"
              autoComplete="email"
            />

            <input
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />

            <button className="btn primary" type="submit" disabled={loading}>
              {loading ? 'Processing…' : mode === 'login' ? 'Login' : 'Register'}
            </button>
          </form>

          <div style={{ marginTop: 14 }}>
            {mode === 'login' ? (
              <button type="button" className="navBtn" onClick={() => setMode('register')}>
                No account? Register
              </button>
            ) : (
              <button type="button" className="navBtn" onClick={() => setMode('login')}>
                Already registered? Login
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
