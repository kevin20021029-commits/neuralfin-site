const STATIC_EXPORT = process.env.STATIC_EXPORT === "1";
const SITE_ORIGIN = process.env.SITE_ORIGIN;

// ★ 静默失败口,堵在这里(构建最早的一刻:Next 先加载本文件,才做任何事)。
//   开了静态导出却不给 SITE_ORIGIN,app/layout.tsx 的 metadataBase 会回落到 .ai ⇒
//   产出的是「一个自称 https://www.neuralfin.ai 的 .cn 站」——**正是本次要治的病**
//   (被判副本、不予收录、ICP 白办),而且**全程无任何提示**,只有拿全站自指面机械扫才看得见。
//   所以:不回落,直接失败,并给出可照抄的命令。
//   注:这道闸只对 STATIC_EXPORT=1 开火;.ai 的 Vercel 构建不设该变量,行为逐字同改前。
if (STATIC_EXPORT && !SITE_ORIGIN) {
  throw new Error(
    [
      "",
      "[next.config.mjs] STATIC_EXPORT=1 但未设 SITE_ORIGIN —— 拒绝构建。",
      "",
      "  静默回落会产出「一个自称 https://www.neuralfin.ai 的静态站」,",
      "  搜索引擎判其为副本、不予收录,ICP 白办。故此处不回落。",
      "",
      "  正确用法:",
      "    STATIC_EXPORT=1 SITE_ORIGIN=https://www.neuralfin.net.cn npm run build",
      "",
    ].join("\n")
  );
}

// ★ 镜面口子 —— 与上面那道【同形同害的反向】。
//   只给 SITE_ORIGIN、不开 STATIC_EXPORT ⇒ 构建仍是 .ai 的常规(Node 运行时)构建,
//   但 app/layout.tsx 的 metadataBase 会取 SITE_ORIGIN ⇒ 产出的是
//   「一个自称 https://www.neuralfin.net.cn 的 .ai 站」。
//   已堵那侧是「自称 .ai 的 .cn 站」,这侧是「自称 .cn 的 .ai 站」——
//   两者都是**站自称错了家**,而且都是**静默**:构建全绿、页面照出,
//   只有拿「全站自指面」机械扫才看得见。
//   今天没有任何合法使用者用这个组合(.ai 的 Vercel 构建不设 SITE_ORIGIN),
//   故此处直接失败。不设 SITE_ORIGIN 时,行为与改动前逐字一致。
if (SITE_ORIGIN && !STATIC_EXPORT) {
  throw new Error(
    [
      "",
      "[next.config.mjs] 设了 SITE_ORIGIN=" + SITE_ORIGIN + " 但没开 STATIC_EXPORT —— 拒绝构建。",
      "",
      "  这组合会构建出一个【常规 .ai 站】,却让全站元数据自称上面那个域。",
      "  搜索引擎会把 .ai 判成 .cn 的副本、不予收录,且全程无任何提示。",
      "",
      "  两种正确用法,二选一:",
      "    静态包(.cn → COS):STATIC_EXPORT=1 SITE_ORIGIN=https://www.neuralfin.net.cn npm run build",
      "    常规构建(.ai)      :npm run build        (两个变量都不给)",
      "",
    ].join("\n")
  );
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 静态导出:产物落到 out/,可直接上传 COS 当纯静态站(无 Node 运行时)。
  //
  // ★ 必须由 STATIC_EXPORT=1 显式开启,不能无条件写死:
  //   本仓同时供 www.neuralfin.ai(Vercel,有 Node 运行时,/scroll 的 3 个动态 API 在用)
  //   与 www.neuralfin.net.cn(COS,纯静态)。写死 output:"export" 会让 .ai 下次部署
  //   一并变成静态站,/scroll 的活动页埋点与排行榜**静默失效** —— 那是在动一条线上功能,
  //   超出本次 .cn 迁移的授权范围。不设这个变量时,行为与改动前逐字一致。
  //   trailingSlash 同理只对静态包开:对象存储(COS)的静态网站托管按「目录 → index.html」
  //   找文件,不会把 /company 映射到 company.html。不开这个,除首页外每个页面都 404。
  ...(STATIC_EXPORT ? { output: "export", trailingSlash: true } : {}),
};

export default nextConfig;
