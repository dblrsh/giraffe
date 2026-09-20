export function PhotosPage() {
  return (
    <section>
      <header><p className="eyebrow">仅 App 沙盒</p><h1>照片</h1></header>
      <div className="empty-state"><span>▧</span><h2>还没有照片</h2><p>拍摄内容将加密保存在本机，不自动存入系统相册或上传。</p><button disabled>拍摄照片</button></div>
    </section>
  );
}
