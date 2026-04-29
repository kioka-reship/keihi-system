"use client";

import React, { useState } from "react";
import Link from "next/link";

// ─── Data ────────────────────────────────────────────────────

const WHO_FOR = [
  { img: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&h=300&fit=crop", title: "副業している会社員", desc: "経費管理を後回しにしがちな方" },
  { img: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=300&fit=crop", title: "個人事業主・フリーランス", desc: "帳簿や確定申告を簡単にしたい方" },
  { img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop", title: "Uber配達員・配送業", desc: "ガソリン代・備品代を整理したい方" },
  { img: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=400&h=300&fit=crop", title: "夜職・接客業", desc: "経費管理をスマホで済ませたい方" },
  { img: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop", title: "小規模店舗オーナー", desc: "レシートや領収書管理を効率化したい方" },
  { img: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=300&fit=crop", title: "会計ソフトで挫折した方", desc: "もっとシンプルなサービスを探している方" },
];

const FEATURES = [
  { icon: "📸", title: "写真を撮るだけで自動入力", desc: "AIが日付・店名・金額・品目を自動認識。入力作業ほぼ不要。" },
  { icon: "🎓", title: "会計知識ゼロでも使える", desc: "勘定科目も自動提案。初心者向けのシンプルUI。" },
  { icon: "📱", title: "スマホだけで完結", desc: "外出先のレシートもその場で即登録。PCは不要。" },
  { icon: "📊", title: "CSV出力OK", desc: "データを一括エクスポート。税理士への提出にも。" },
  { icon: "✂️", title: "副業・個人事業主向け", desc: "難しい機能を削ぎ落とした、本当に必要なものだけ。" },
  { icon: "🔒", title: "データは安全に保存", desc: "Supabase（AWS東京リージョン）に暗号化して保存。" },
];

const COMPARISON = [
  { label: "使いやすさ",       keihi: "◎", a: "△", b: "△" },
  { label: "初心者向け",       keihi: "◎", a: "△", b: "△" },
  { label: "写真アップロード", keihi: "◎", a: "○", b: "○" },
  { label: "設定の少なさ",     keihi: "◎", a: "△", b: "△" },
  { label: "シンプルさ",       keihi: "◎", a: "△", b: "△" },
  { label: "副業向け",         keihi: "◎", a: "△", b: "△" },
];

const FAQS = [
  { q: "初心者でも使えますか？", a: "はい。誰でも使えるシンプルな設計です。会計の知識がなくても大丈夫です。" },
  { q: "スマホだけで使えますか？", a: "はい。スマホ中心で設計されています。撮影・登録・確認すべてスマホで完結します。" },
  { q: "無料プランはありますか？", a: "毎月3枚まで無料でお試しいただけます。登録・クレジットカード不要です。" },
  { q: "データは安全ですか？", a: "Supabase（AWSの東京リージョン）に暗号化して保存しています。第三者への提供は一切しません。" },
  { q: "解約はいつでもできますか？", a: "はい。マイページからいつでも即時解約できます。解約後も当月末まで利用できます。" },
];

// ─── Helpers ────────────────────────────────────────────────

function SectionTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="text-center mb-10 sm:mb-14">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{title}</h2>
      {sub && <p className="mt-3 text-gray-500 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">{sub}</p>}
    </div>
  );
}

function Btn({ href, primary, children }: { href: string; primary?: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center px-7 py-4 rounded-2xl font-bold text-sm sm:text-base transition-all ${
        primary
          ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-0.5"
          : "border-2 border-gray-300 hover:border-blue-400 text-gray-700 hover:text-blue-600 hover:-translate-y-0.5"
      }`}
    >
      {children}
    </Link>
  );
}

function PhoneShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-44 shrink-0 mx-auto">
      <div className="bg-gray-900 rounded-[2.2rem] p-1.5 shadow-2xl ring-1 ring-white/5">
        <div className="bg-white rounded-[1.8rem] overflow-hidden h-80 flex flex-col">
          <div className="shrink-0 bg-white px-4 pt-2 pb-1 flex justify-between items-center">
            <span className="text-[9px] font-semibold text-gray-700">9:41</span>
            <span className="text-[8px] text-gray-400">●●●</span>
          </div>
          <div className="flex-1 overflow-hidden bg-gray-50 text-[10px]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Header ────────────────────────────────────────────────

function LpHeader() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <span className="font-bold text-blue-700 text-lg">📒 経費帳簿</span>
        <div className="flex items-center gap-2">
          <Link href="/auth/login" className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            ログイン
          </Link>
          <Link href="/auth/register" className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl transition-colors">
            無料で始める
          </Link>
        </div>
      </div>
    </header>
  );
}

// ─── Hero ─────────────────────────────────────────────────

function HeroPhone() {
  const items = [
    { store: "セブンイレブン", date: "4/15", amount: "¥1,200", cat: "消耗品費" },
    { store: "電車代",         date: "4/14", amount: "¥450",   cat: "旅費交通費" },
    { store: "山田文具",       date: "4/12", amount: "¥3,200", cat: "消耗品費" },
    { store: "焼肉まさる",     date: "4/10", amount: "¥8,800", cat: "接待交際費" },
  ];
  return (
    <div className="w-64 mx-auto shrink-0">
      <div className="bg-gray-900 rounded-[3rem] p-2.5 shadow-2xl ring-1 ring-white/5">
        <div className="bg-gray-50 rounded-[2.4rem] overflow-hidden">
          <div className="bg-white px-5 pt-3 pb-1.5 flex justify-between">
            <span className="text-[10px] font-semibold">9:41</span>
            <span className="text-[10px] text-gray-300">●●●</span>
          </div>
          <div className="bg-white border-b border-gray-100 px-4 py-2">
            <p className="text-xs font-bold text-blue-700">📒 経費帳簿</p>
          </div>
          <div className="p-3 space-y-2">
            <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
              <p className="text-[9px] text-gray-400">4月の経費合計</p>
              <p className="text-xl font-bold text-gray-900 mt-0.5">¥24,800</p>
              <p className="text-[9px] text-gray-400">8件</p>
            </div>
            {items.map((item, i) => (
              <div key={i} className="bg-white rounded-xl px-3 py-2 border border-gray-100 shadow-sm flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-medium text-gray-800">{item.store}</p>
                  <p className="text-[9px] text-gray-400">{item.date} · {item.cat}</p>
                </div>
                <p className="text-[10px] font-bold text-gray-900">{item.amount}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="bg-gradient-to-b from-blue-50/70 via-blue-50/20 to-white">
      <div className="max-w-5xl mx-auto px-4 pt-16 pb-24">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <div className="flex-1 text-center lg:text-left">
            <p className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-6">
              ✨ AIレシート解析 × 経費帳簿
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight">
              レシートを撮るだけ。<br />
              <span className="text-blue-600">面倒な帳簿、<wbr />もう終わり。</span>
            </h1>
            <p className="mt-6 text-base sm:text-lg text-gray-500 leading-relaxed">
              AIがレシートを自動解析。<br />
              日付・店名・金額・品目までまとめて整理。<br />
              初心者でも数分で経費管理スタート。
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Btn href="/auth/register" primary>今すぐ無料で試す →</Btn>
              <Btn href="/auth/register">3分で使い始める</Btn>
            </div>
            <p className="mt-4 text-xs text-gray-400">登録無料・クレジットカード不要・月3枚まで永久無料</p>
          </div>
          <div className="shrink-0">
            <HeroPhone />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Who For ──────────────────────────────────────────────

function WhoFor() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4">
        <SectionTitle title="こんな方におすすめ" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5">
          {WHO_FOR.map((item, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <img src={item.img} alt={item.title} className="w-full h-32 sm:h-40 object-cover" loading="lazy" />
              <div className="p-4">
                <p className="text-sm font-bold text-gray-900 leading-snug">{item.title}</p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How To ───────────────────────────────────────────────

function HowTo() {
  const steps = [
    { n: "1", icon: "📷", title: "撮影・アップロード", desc: "レシートをスマホで撮影してアップロード。最大5枚まとめてOK。" },
    { n: "2", icon: "🤖", title: "AIが自動で整理",    desc: "日付・店名・金額・品目を自動解析。勘定科目も自動提案。" },
    { n: "3", icon: "📊", title: "帳簿完成・CSV出力", desc: "一覧管理・科目別集計・CSV出力で確定申告準備が完了。" },
  ];
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4">
        <SectionTitle title="使い方はたった3ステップ" />
        <div className="flex flex-col md:flex-row items-stretch gap-4 md:gap-3">
          {steps.map((step, i) => (
            <React.Fragment key={step.n}>
              <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-extrabold text-xl flex items-center justify-center shadow-md shadow-blue-100">
                  {step.n}
                </div>
                <div className="text-4xl mt-4">{step.icon}</div>
                <p className="font-bold text-gray-900 mt-3">{step.title}</p>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">{step.desc}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden md:flex items-center text-3xl text-gray-300 shrink-0 select-none">→</div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Phone Mocks ─────────────────────────────────────────

function MockUpload() {
  return (
    <PhoneShell>
      <div className="px-2 pt-2 space-y-1.5">
        <div className="bg-white rounded-lg px-2 py-1.5 border-b border-gray-100">
          <p className="text-[9px] font-bold text-gray-800">経費を登録</p>
        </div>
        {[1, 2, 3].map(n => (
          <div key={n} className="bg-white rounded-xl border border-gray-200 p-2 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-base">📷</div>
            <div>
              <p className="text-[9px] font-medium text-gray-700">レシート {n}</p>
              <p className="text-[8px] text-gray-400">クリックで選択</p>
            </div>
          </div>
        ))}
        <button className="w-full bg-blue-600 text-white rounded-xl py-2 text-[9px] font-bold">
          🔍 AIで解析する（3枚）
        </button>
      </div>
    </PhoneShell>
  );
}

function MockList() {
  const rows = [
    { date: "4/15", store: "セブンイレブン", amount: "¥1,200", cat: "消耗品費" },
    { date: "4/14", store: "電車代",         amount: "¥450",   cat: "旅費交通費" },
    { date: "4/12", store: "山田文具",       amount: "¥3,200", cat: "消耗品費" },
    { date: "4/10", store: "焼肉まさる",     amount: "¥8,800", cat: "接待交際費" },
  ];
  return (
    <PhoneShell>
      <div className="px-2 pt-2 space-y-1">
        <div className="bg-white rounded-lg px-2 py-1.5">
          <p className="text-[9px] font-bold text-gray-800">経費一覧</p>
        </div>
        <div className="bg-white rounded-xl px-2 py-1.5 flex justify-between items-center border border-gray-100">
          <span className="text-[9px] text-gray-400">◀</span>
          <span className="text-[9px] font-bold text-gray-800">2026年4月</span>
          <span className="text-[9px] text-gray-300">▶</span>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
          {rows.map((r, i) => (
            <div key={i} className="px-2 py-1.5 flex justify-between items-start">
              <div>
                <p className="text-[9px] font-medium text-gray-800">{r.store}</p>
                <p className="text-[8px] text-gray-400">{r.date} · {r.cat}</p>
              </div>
              <p className="text-[9px] font-bold text-gray-900">{r.amount}</p>
            </div>
          ))}
        </div>
      </div>
    </PhoneShell>
  );
}

function MockSummary() {
  const cats = [
    { name: "旅費交通費", amount: "¥12,000", pct: 85 },
    { name: "消耗品費",   amount: "¥8,400",  pct: 60 },
    { name: "接待交際費", amount: "¥4,400",  pct: 31 },
  ];
  return (
    <PhoneShell>
      <div className="px-2 pt-2 space-y-1.5">
        <div className="bg-white rounded-lg px-2 py-1.5">
          <p className="text-[9px] font-bold text-gray-800">月別集計</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-2">
          <p className="text-[8px] text-gray-400">4月の経費合計</p>
          <p className="text-base font-bold text-gray-900">¥24,800</p>
          <p className="text-[8px] text-gray-400">8件</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-2 space-y-1.5">
          <p className="text-[8px] font-bold text-gray-600">科目別</p>
          {cats.map((c, i) => (
            <div key={i}>
              <div className="flex justify-between mb-0.5">
                <span className="text-[8px] text-gray-600">{c.name}</span>
                <span className="text-[8px] font-bold">{c.amount}</span>
              </div>
              <div className="h-1 bg-gray-100 rounded-full">
                <div className="h-full bg-blue-400 rounded-full" style={{ width: `${c.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </PhoneShell>
  );
}

function MockPricing() {
  const plans = [
    { name: "ライト",        price: "¥980",   cnt: "20枚/月" },
    { name: "スタンダード",  price: "¥1,680", cnt: "40枚/月", popular: true },
    { name: "PRO",           price: "¥2,980", cnt: "120枚/月" },
  ];
  return (
    <PhoneShell>
      <div className="px-2 pt-2 space-y-1.5">
        <div className="bg-white rounded-lg px-2 py-1.5">
          <p className="text-[9px] font-bold text-gray-800">プランを選ぶ</p>
        </div>
        {plans.map((p, i) => (
          <div key={i} className={`rounded-xl border p-2 ${p.popular ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-white"}`}>
            <div className="flex justify-between items-center">
              <div>
                {p.popular && <p className="text-[7px] font-bold text-blue-600">★ 人気</p>}
                <p className={`text-[9px] font-bold ${p.popular ? "text-blue-700" : "text-gray-800"}`}>{p.name}</p>
                <p className="text-[8px] text-gray-400">{p.cnt}</p>
              </div>
              <p className={`text-[9px] font-bold ${p.popular ? "text-blue-700" : "text-gray-900"}`}>{p.price}<span className="font-normal">/月</span></p>
            </div>
          </div>
        ))}
      </div>
    </PhoneShell>
  );
}

function MockCredits() {
  const packs = [
    { cnt: "20枚",  price: "¥380" },
    { cnt: "50枚",  price: "¥880", popular: true },
    { cnt: "100枚", price: "¥1,580" },
    { cnt: "300枚", price: "¥3,480" },
  ];
  return (
    <PhoneShell>
      <div className="px-2 pt-2 space-y-1.5">
        <div className="bg-white rounded-lg px-2 py-1.5">
          <p className="text-[9px] font-bold text-gray-800">追加枚数を購入</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-2 py-1">
          <p className="text-[8px] text-amber-700">当月限り・繰り越しなし</p>
        </div>
        {packs.map((p, i) => (
          <div key={i} className={`rounded-xl border p-2 flex justify-between items-center ${p.popular ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-white"}`}>
            <div>
              {p.popular && <p className="text-[7px] text-blue-600 font-bold">人気</p>}
              <p className={`text-[9px] font-bold ${p.popular ? "text-blue-700" : "text-gray-800"}`}>追加{p.cnt}</p>
            </div>
            <p className="text-[9px] font-bold text-gray-900">{p.price}</p>
          </div>
        ))}
      </div>
    </PhoneShell>
  );
}

function MockScreens() {
  const mocks = [
    { label: "① レシートアップロード",   component: <MockUpload /> },
    { label: "② 経費一覧",              component: <MockList /> },
    { label: "③ 月別集計",              component: <MockSummary /> },
    { label: "④ 料金プラン",            component: <MockPricing /> },
    { label: "⑤ 追加購入",             component: <MockCredits /> },
  ];
  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="max-w-5xl mx-auto px-4">
        <SectionTitle title="実際の画面を見てみよう" />
      </div>
      <div
        className="flex gap-6 px-8 overflow-x-auto pb-6 snap-x snap-mandatory"
        style={{ scrollbarWidth: "none" }}
      >
        {mocks.map((m, i) => (
          <div key={i} className="shrink-0 snap-center flex flex-col items-center gap-3">
            {m.component}
            <p className="text-xs text-gray-500 font-medium text-center">{m.label}</p>
          </div>
        ))}
        <div className="shrink-0 w-4" aria-hidden />
      </div>
    </section>
  );
}

// ─── Features ────────────────────────────────────────────

function Features() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4">
        <SectionTitle title="選ばれる理由" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5">
          {FEATURES.map((f, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <div className="text-3xl mb-3">{f.icon}</div>
              <p className="font-bold text-gray-900 text-sm leading-snug">{f.title}</p>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Comparison ──────────────────────────────────────────

function Comparison() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4">
        <SectionTitle title="あなたに合うのは、どのタイプ？" />
        <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
          <table className="w-full min-w-[480px] text-sm border-collapse">
            <thead>
              <tr>
                <th className="text-left px-4 py-3 bg-gray-50 text-gray-500 font-medium text-xs w-36">比較項目</th>
                <th className="px-4 py-3 bg-blue-600 text-white font-bold text-center">
                  <span className="block text-base">📒 keihi</span>
                  <span className="block text-xs font-normal opacity-80">当サービス</span>
                </th>
                <th className="px-4 py-3 bg-gray-50 text-gray-600 font-medium text-center text-xs">A社（高機能型）</th>
                <th className="px-4 py-3 bg-gray-50 text-gray-600 font-medium text-center text-xs">B社（総合管理型）</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/60"}>
                  <td className="px-4 py-3 text-gray-600 text-xs font-medium">{row.label}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm">{row.keihi}</span>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-400 font-medium">{row.a}</td>
                  <td className="px-4 py-3 text-center text-gray-400 font-medium">{row.b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 mt-3 text-center">※ A社・B社は実在企業との比較ではなく、一般的な同カテゴリのサービス傾向を表しています。</p>
      </div>
    </section>
  );
}

// ─── Pricing ─────────────────────────────────────────────

function Pricing() {
  const plans = [
    {
      key: "light",
      name: "ライト",
      price: "980",
      cnt: 20,
      desc: "副業・個人利用向け",
      features: ["月20枚まで解析", "全勘定科目対応", "CSV出力", "データ永続保存"],
    },
    {
      key: "standard",
      name: "スタンダード",
      price: "1,680",
      cnt: 40,
      desc: "個人事業主向け",
      features: ["月40枚まで解析", "全勘定科目対応", "CSV出力", "データ永続保存"],
      popular: true,
    },
    {
      key: "pro",
      name: "PRO",
      price: "2,980",
      cnt: 120,
      desc: "レシートが多い方向け",
      features: ["月120枚まで解析", "全勘定科目対応", "CSV出力", "データ永続保存", "優先サポート"],
    },
  ];
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4">
        <SectionTitle
          title="シンプルな料金プラン"
          sub="いつでも解約OK・クレジットカード対応"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-start">
          {plans.map((plan) => (
            <div
              key={plan.key}
              className={`relative bg-white rounded-2xl border-2 p-6 flex flex-col ${
                plan.popular
                  ? "border-blue-500 shadow-xl shadow-blue-100 sm:-mt-4 sm:mb-0"
                  : "border-gray-200 shadow-sm"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-4 py-0.5 rounded-full whitespace-nowrap">
                  ★ 人気プラン
                </div>
              )}
              <div>
                <p className="font-bold text-gray-900 text-lg">{plan.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{plan.desc}</p>
                <p className="mt-3">
                  <span className="text-3xl font-extrabold text-gray-900">¥{plan.price}</span>
                  <span className="text-sm text-gray-500">/月</span>
                </p>
                <p className="text-sm text-blue-600 font-medium mt-1">月{plan.cnt}枚まで解析</p>
              </div>
              <ul className="mt-5 space-y-1.5 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-green-500 font-bold shrink-0">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/register"
                className={`mt-6 block text-center font-bold text-sm rounded-xl py-3 transition-colors ${
                  plan.popular
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "border border-gray-300 hover:border-blue-400 text-gray-700 hover:text-blue-600"
                }`}
              >
                今すぐ始める
              </Link>
            </div>
          ))}
        </div>

        {/* 追加購入オプション */}
        <div className="mt-10 text-center">
          <p className="text-sm text-gray-500 font-medium mb-3">必要な時だけ追加できます（当月限り）</p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { label: "追加20枚", price: "¥380" },
              { label: "追加50枚", price: "¥880" },
              { label: "追加100枚", price: "¥1,580" },
              { label: "追加300枚", price: "¥3,480" },
            ].map((p, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm">
                <span className="text-gray-700 font-medium">{p.label}</span>
                <span className="text-gray-500 ml-1">：</span>
                <span className="font-bold text-gray-900">{p.price}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-center text-gray-400 mt-8">
          クレジットカード決済対応 · いつでも解約可能 · Stripeによる安全な決済
        </p>
      </div>
    </section>
  );
}

// ─── FAQ ────────────────────────────────────────────────

function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="py-20 bg-white">
      <div className="max-w-2xl mx-auto px-4">
        <SectionTitle title="よくある質問" />
        <div className="space-y-2">
          {FAQS.map((item, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <button
                className="w-full flex items-center justify-between px-5 py-4 text-left"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="text-sm font-semibold text-gray-800 pr-4">{item.q}</span>
                <span className={`shrink-0 text-gray-400 transition-transform duration-200 ${open === i ? "rotate-180" : ""}`}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>
              {open === i && (
                <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Final CTA ──────────────────────────────────────────

function FinalCta() {
  return (
    <section className="py-24 bg-gradient-to-br from-blue-600 to-blue-700">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight tracking-tight">
          レシート管理、今日で<br />終わらせませんか？
        </h2>
        <p className="mt-4 text-blue-100 text-base">
          登録無料・3枚まで今すぐ試せます
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/auth/register"
            className="inline-flex items-center justify-center px-8 py-4 rounded-2xl font-bold text-base bg-white text-blue-600 hover:bg-blue-50 transition-colors shadow-lg"
          >
            今すぐ無料で試す →
          </Link>
          <Link
            href="/auth/register"
            className="inline-flex items-center justify-center px-8 py-4 rounded-2xl font-bold text-base border-2 border-white/40 text-white hover:bg-white/10 transition-colors"
          >
            3分でスタート
          </Link>
        </div>
        <p className="mt-5 text-xs text-blue-200">クレジットカード不要 · いつでも解約可能</p>
      </div>
    </section>
  );
}

// ─── Footer ─────────────────────────────────────────────

function LpFooter() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-8">
          <div>
            <p className="font-bold text-white text-lg">📒 keihi</p>
            <p className="text-sm mt-1.5 text-gray-400 max-w-xs leading-relaxed">
              AIがレシートを自動解析。白色申告に対応した経費帳簿SaaS。
            </p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <Link href="/privacy" className="hover:text-white transition-colors">プライバシーポリシー</Link>
            <Link href="/terms"   className="hover:text-white transition-colors">利用規約</Link>
            <Link href="/faq"     className="hover:text-white transition-colors">よくある質問</Link>
            <Link href="/contact" className="hover:text-white transition-colors">お問い合わせ</Link>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-800 text-xs text-center text-gray-600">
          © 2026 keihi. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

// ─── Page ───────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased">
      <LpHeader />
      <main>
        <Hero />
        <WhoFor />
        <HowTo />
        <MockScreens />
        <Features />
        <Comparison />
        <Pricing />
        <FaqSection />
        <FinalCta />
      </main>
      <LpFooter />
    </div>
  );
}
