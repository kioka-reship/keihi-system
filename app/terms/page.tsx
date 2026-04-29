export const metadata = {
  title: "利用規約 | keihi",
};

export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8 py-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">利用規約</h1>
        <p className="text-sm text-gray-500 mt-1">制定日：2026年1月1日　最終改定：2026年4月29日</p>
      </div>

      <p className="text-sm text-gray-600 leading-relaxed">
        本利用規約（以下「本規約」）は、当サービス「keihi」（以下「当サービス」）の利用条件を定めるものです。ユーザーは本規約に同意の上、当サービスをご利用ください。
      </p>

      <Section title="第1条（サービス概要）">
        <p>当サービスは、白色申告・青色申告に対応した経費帳簿管理サービスです。AIによるレシート画像解析機能、経費データの記録・管理、CSV出力機能を提供します。AI解析結果はあくまで補助的なものであり、申告内容の正確性を保証するものではありません。</p>
      </Section>

      <Section title="第2条（利用登録・アカウント）">
        <ul>
          <li>利用登録はメールアドレスとパスワードにより行います。</li>
          <li>登録情報は正確かつ最新の情報を入力してください。</li>
          <li>アカウントは本人のみが使用できます。第三者への譲渡・貸与は禁止します。</li>
          <li>パスワードの管理はユーザー自身の責任で行ってください。</li>
          <li>登録情報に変更があった場合は速やかに更新してください。</li>
        </ul>
      </Section>

      <Section title="第3条（禁止事項）">
        <p>以下の行為を禁止します。</p>
        <ul>
          <li>法令または本規約に違反する行為</li>
          <li>他のユーザーや第三者の権利を侵害する行為</li>
          <li>不正アクセス・クラッキング・リバースエンジニアリング</li>
          <li>スパム送信・フィッシング等の詐欺的行為</li>
          <li>当サービスのシステムへの過度な負荷をかける行為</li>
          <li>他のユーザーになりすます行為</li>
          <li>当サービスの運営を妨害する行為</li>
          <li>その他、当サービスが不適切と判断する行為</li>
        </ul>
      </Section>

      <Section title="第4条（料金・決済・解約）">
        <div className="space-y-3">
          <div>
            <p className="font-semibold text-gray-700">無料プラン（お試し）</p>
            <p>月3枚までAI解析を無料でご利用いただけます。</p>
          </div>
          <div>
            <p className="font-semibold text-gray-700">有料サブスクリプション</p>
            <ul>
              <li>ライト（月20枚）¥980/月、スタンダード（月40枚）¥1,680/月、PRO（月120枚）¥2,980/月</li>
              <li>毎月自動更新されます。</li>
              <li>決済はStripeにより処理されます。</li>
              <li>解約はマイページからいつでも可能です。解約後も当月末まで利用できます。</li>
              <li>月途中の解約による日割り返金は行いません。</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-gray-700">追加枚数購入（一回払い）</p>
            <ul>
              <li>追加購入した枚数は当月限りです。翌月1日にリセットされ、繰り越しはありません。</li>
              <li>購入完了後のキャンセル・返金は原則行いません。</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-gray-700">価格改定</p>
            <p>料金は事前に告知の上変更することがあります。</p>
          </div>
        </div>
      </Section>

      <Section title="第5条（免責事項）">
        <ul>
          <li>AI解析結果（日付・金額・勘定科目等）の正確性を保証しません。必ず内容を確認した上でご利用ください。</li>
          <li>当サービスは確定申告の代行・税務アドバイスを提供するものではありません。申告については税理士等の専門家にご相談ください。</li>
          <li>システム障害・メンテナンス等によるサービス停止について責任を負いません。</li>
          <li>ユーザーが当サービスを通じて得た情報の利用結果について責任を負いません。</li>
          <li>第三者サービス（Stripe・Supabase等）の障害による損害について責任を負いません。</li>
        </ul>
      </Section>

      <Section title="第6条（サービスの変更・停止）">
        <p>当サービスは、事前の通知なくサービスの内容を変更・追加・削除することがあります。また、システムメンテナンス、天災、その他やむを得ない事情によりサービスを一時停止することがあります。サービスの終了は少なくとも30日前に通知します。</p>
      </Section>

      <Section title="第7条（知的財産権）">
        <p>当サービスのコンテンツ・デザイン・プログラム等の知的財産権は当サービスまたは正当な権利者に帰属します。ユーザーがアップロードしたデータの権利はユーザーに帰属しますが、サービス提供のために必要な範囲で利用することに同意いただきます。</p>
      </Section>

      <Section title="第8条（アカウントの停止・削除）">
        <p>当サービスは、ユーザーが本規約に違反した場合、事前通知なくアカウントを停止または削除することがあります。</p>
      </Section>

      <Section title="第9条（準拠法・裁判管轄）">
        <p>本規約は日本法に準拠して解釈されます。当サービスに関する紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とします。</p>
      </Section>

      <Section title="第10条（規約の変更）">
        <p>当サービスは必要に応じて本規約を変更することがあります。重要な変更の際はサービス内でお知らせします。変更後も継続してご利用いただいた場合、変更後の規約に同意したものとみなします。</p>
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
