export function HealthPage() {
  return (
    <section>
      <header><p className="eyebrow">HealthKit · 只读</p><h1>健康</h1></header>
      <article className="card"><h2>等待原生授权</h2><p>首版将按需读取步数、心率与睡眠，不会写入健康数据。</p><button disabled>在 iPhone 上授权</button></article>
      <div className="chart-placeholder" aria-label="健康图表占位"><span>图表将在数据可用后显示</span></div>
    </section>
  );
}
