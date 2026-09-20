export function ChatPage() {
  return (
    <section>
      <header><p className="eyebrow">本机保存</p><h1>AI 会话</h1></header>
      <div className="empty-state"><span>✦</span><h2>开始一段新会话</h2><p>程序骨架已建立。密钥、发送确认与流式回答将在阶段 C 接入。</p></div>
      <div className="composer"><textarea aria-label="消息草稿" placeholder="输入内容…" disabled /><button disabled>发送</button></div>
    </section>
  );
}
