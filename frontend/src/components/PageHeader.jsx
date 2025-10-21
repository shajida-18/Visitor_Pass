export default function PageHeader({ title, subtitle, right }) {
  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div className="row">
        <div>
          <h2 style={{ margin: 0 }}>{title}</h2>
          {subtitle && <div className="muted" style={{ marginTop: 6 }}>{subtitle}</div>}
        </div>
        <div>{right}</div>
      </div>
    </div>
  );
}