import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <section>
      <header className="hero">
        <p className="eyebrow">9 月 20 日 · 本地数据</p>
        <h1>晚上好</h1>
        <p>今天也照顾好自己。</p>
      </header>
      <div className="metric-grid">
        <article className="card metric"><span>今日步数</span><strong>6,428</strong><small>模拟数据</small></article>
        <article className="card metric"><span>昨夜睡眠</span><strong>7 小时 18 分</strong><small>模拟数据</small></article>
      </div>
      <article className="card">
        <div className="card-title"><h2>最近会话</h2><Link to="/chat">查看全部</Link></div>
        <p className="empty">尚无真实会话。连接原生存储后将在这里显示。</p>
      </article>
      <article className="privacy-note">锁屏时敏感内容不可读取。AI 联网默认关闭，只有经原生确认的内容才会发送。</article>
    </section>
  );
}
