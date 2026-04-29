export const metadata = {
  title: "プライバシーポリシー | keihi",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8 py-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">プライバシーポリシー</h1>
        <p className="text-sm text-gray-500 mt-1">制定日：2026年1月1日　最終改定：2026年4月29日</p>
      </div>

      <p className="text-sm text-gray-600 leading-relaxed">
        keihi（以下「当サービス」）は、ユーザーの個人情報の保護を重要な責務と認識し、以下のプライバシーポリシーに従って適切に取り扱います。
      </p>

      <Section title="1. 収集する情報">
        <p>当サービスは以下の情報を収集します。</p>
        <ul>
          <li><strong>アカウント情報：</strong>メールアドレス、パスワード（暗号化されたハッシュのみ）</li>
          <li><strong>レシート・領収書画像：</strong>経費登録時にアップロードされた画像データ</li>
          <li><strong>経費データ：</strong>日付、店名、金額、勘定科目、品目、メモ等の入力内容</li>
          <li><strong>決済情報：</strong>プラン・追加購入の取引履歴（カード番号等の機密決済情報はStripeが管理し、当サービスは保持しません）</li>
          <li><strong>利用データ：</strong>月間解析枚数、プラン情報</li>
          <li><strong>アクセスログ：</strong>IPアドレス、ブラウザ情報、操作ログ（セキュリティ目的）</li>
        </ul>
      </Section>

      <Section title="2. 情報の利用目的">
        <ul>
          <li>サービスの提供・運営・改善</li>
          <li>AIによるレシート解析機能の提供</li>
          <li>プラン管理・課金処理</li>
          <li>ユーザーサポート・お問い合わせへの対応</li>
          <li>利用規約違反・不正利用の防止</li>
          <li>サービスに関する重要なお知らせの送信</li>
        </ul>
      </Section>

      <Section title="3. 第三者への提供">
        <p>当サービスは、以下の業務委託先にサービス提供に必要な範囲で情報を提供します。これらの事業者への提供はユーザーの同意のもとに行われます。</p>
        <div className="space-y-3 mt-3">
          <ThirdParty name="Supabase, Inc." purpose="データベース・認証サービス" link="https://supabase.com/privacy" />
          <ThirdParty name="Stripe, Inc." purpose="オンライン決済処理" link="https://stripe.com/jp/privacy" />
          <ThirdParty name="Google LLC（Gemini API）" purpose="AIによるレシート画像解析" link="https://policies.google.com/privacy" />
          <ThirdParty name="Vercel, Inc." purpose="アプリケーションホスティング" link="https://vercel.com/legal/privacy-policy" />
          <ThirdParty name="Resend, Inc." purpose="メール送信サービス" link="https://resend.com/legal/privacy-policy" />
        </div>
        <p className="mt-3">上記以外の第三者への提供は、法令に基づく場合、ユーザーの同意がある場合を除き行いません。</p>
      </Section>

      <Section title="4. データの保管・セキュリティ">
        <ul>
          <li>データはSupabase（AWSインフラ、東京リージョン）に暗号化して保存されます。</li>
          <li>レシート画像はSupabase Storageに保存され、認証済みユーザーのみアクセスできます。</li>
          <li>通信はすべてTLS（HTTPS）で暗号化されます。</li>
          <li>アクセス制御（RLS：行レベルセキュリティ）により、自分のデータのみ参照・操作できます。</li>
        </ul>
      </Section>

      <Section title="5. データの保存期間">
        <ul>
          <li>アカウント削除のご依頼後、30日以内に個人データを削除します。</li>
          <li>法令上の保存義務がある場合は、当該期間中保存することがあります。</li>
        </ul>
      </Section>

      <Section title="6. ユーザーの権利">
        <p>ユーザーは以下の権利を有します。</p>
        <ul>
          <li><strong>開示請求：</strong>当サービスが保有する個人情報の開示を求めることができます。</li>
          <li><strong>訂正・削除請求：</strong>不正確な情報の訂正、またはアカウント・データの削除を求めることができます。</li>
          <li><strong>利用停止請求：</strong>個人情報の利用停止を求めることができます。</li>
        </ul>
        <p className="mt-2">行使を希望される場合は、下記お問い合わせ先までご連絡ください。本人確認の上、合理的な期間内に対応いたします。</p>
      </Section>

      <Section title="7. Cookieおよびアクセス解析">
        <p>当サービスはセッション管理のためのCookieおよびGoogle Analytics（GA4）を使用します。Google Analyticsは匿名化されたアクセスデータを収集します。ブラウザの設定によりCookieを無効化できますが、一部機能が使用できなくなる場合があります。</p>
      </Section>

      <Section title="8. お問い合わせ先">
        <p>個人情報の取り扱いに関するお問い合わせは、サービス内のお問い合わせフォーム（<a href="/contact" className="text-blue-600 underline">/contact</a>）よりご連絡ください。</p>
      </Section>

      <Section title="9. ポリシーの変更">
        <p>当ポリシーは必要に応じて変更することがあります。重要な変更の際はサービス内でお知らせします。</p>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-base font-bold text-gray-800 border-b border-gray-200 pb-2">{title}</h2>
      <div className="text-sm text-gray-600 leading-relaxed space-y-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">
        {children}
      </div>
    </section>
  );
}

function ThirdParty({ name, purpose, link }: { name: string; purpose: string; link: string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <p className="font-medium text-gray-800 text-sm">{name}</p>
      <p className="text-xs text-gray-500 mt-0.5">{purpose}</p>
      <a href={link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
        プライバシーポリシーを確認 →
      </a>
    </div>
  );
}
