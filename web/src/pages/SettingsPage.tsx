import { useEffect, useState } from "react";
import { nativeClient } from "../bridge/client";
import type { CapabilitiesResult, UpdateStatus, VersionsResult } from "../bridge/types";

export function SettingsPage() {
  const [versions, setVersions] = useState<VersionsResult>();
  const [capabilities, setCapabilities] = useState<CapabilitiesResult>();
  const [updates, setUpdates] = useState<UpdateStatus>();

  useEffect(() => {
    let active = true;
    Promise.all([nativeClient.getVersions(), nativeClient.getCapabilities(), nativeClient.getUpdateStatus()])
      .then(([v, c, u]) => { if (active) { setVersions(v); setCapabilities(c); setUpdates(u); } })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  return (
    <section>
      <header><p className="eyebrow">诊断信息已脱敏</p><h1>设置</h1></header>
      <article className="card settings-list">
        <div><span>原生版本</span><strong>{versions?.nativeVersion ?? "读取中"}</strong></div>
        <div><span>Web 版本</span><strong>{versions?.webVersion ?? "读取中"}</strong></div>
        <div><span>Bridge</span><strong>v{versions?.bridgeVersion ?? "-"}</strong></div>
        <div><span>更新状态</span><strong>{updates?.state ?? "读取中"}</strong></div>
        <div><span>可用能力</span><strong>{capabilities?.capabilities.length ?? 0}</strong></div>
      </article>
      <article className="card"><h2>AI 联网</h2><p>默认关闭。API Key 只能在原生安全界面输入，Web 无法读取。</p><button disabled>打开原生设置</button></article>
      {updates?.message && <p className="footnote">{updates.message}</p>}
    </section>
  );
}
