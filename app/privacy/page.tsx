import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'プライバシーポリシー',
  description: '保険データドットコムのプライバシーポリシーです。個人情報の取り扱い・GA4によるデータ収集・アフィリエイト広告の使用について説明します。',
}

export default function PrivacyPage() {
  return (
    <>
      <section className="bg-[#0f172a] text-white py-14 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
            <Link href="/" className="hover:text-white">トップ</Link>
            <span>›</span>
            <span>プライバシーポリシー</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-bold">プライバシーポリシー</h1>
          <p className="text-gray-400 text-sm mt-3">最終更新日：2026年6月9日</p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-12 space-y-10 text-gray-700 text-sm leading-relaxed">

        <section>
          <h2 className="text-lg font-bold text-[#0f172a] mb-4 pb-2 border-b border-gray-200">1. 基本方針</h2>
          <p>保険データドットコム（以下「本サイト」）は、ユーザーのプライバシーを尊重し、個人情報の適切な保護に努めます。本プライバシーポリシーは、本サイトにおける情報の収集・利用・管理方針を説明するものです。</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[#0f172a] mb-4 pb-2 border-b border-gray-200">2. 収集する情報</h2>
          <p className="mb-3">本サイトでは以下の情報を収集することがあります。</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>アクセスログ（IPアドレス・ブラウザ情報・アクセス日時・参照URL等）</li>
            <li>Cookieおよびそれに類する技術を通じて収集される情報</li>
            <li>Google Analytics 4（GA4）を通じて収集される行動データ（ページ閲覧・クリック等）</li>
          </ul>
          <p className="mt-3">本サイトは、氏名・住所・電話番号・メールアドレス等の個人を直接特定できる情報は収集しておりません。</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[#0f172a] mb-4 pb-2 border-b border-gray-200">3. Google Analytics 4（GA4）について</h2>
          <p className="mb-3">本サイトはGoogle LLCが提供するアクセス解析ツール「Google Analytics 4」を使用しています。GA4はCookieを使用してユーザーの行動データを収集・分析します。</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>収集されるデータはGoogleのプライバシーポリシーに基づいて管理されます</li>
            <li>収集されたデータは個人を特定するために使用されません</li>
            <li>Googleのオプトアウトアドオンを使用することで、データ収集を無効化できます</li>
          </ul>
          <p className="mt-3">
            Google プライバシーポリシー：
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#2563eb] hover:underline ml-1">
              https://policies.google.com/privacy
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[#0f172a] mb-4 pb-2 border-b border-gray-200">4. アフィリエイト広告について</h2>
          <p className="mb-3">本サイトはアフィリエイト広告を掲載しています。本サイト内のリンクから保険会社・比較サービス等への誘導が発生し、申込み等があった場合に運営者が紹介料を受け取ることがあります。</p>
          <p>掲載している情報・相場データは広告主からの影響を受けておらず、公的統計データに基づいた中立的な情報提供を目的としています。</p>
          <p className="mt-3 text-xs bg-[#f8fafc] rounded p-3 border-l-4 border-[#f59e0b]">
            本サイトはアフィリエイト広告を含みます（PR）
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[#0f172a] mb-4 pb-2 border-b border-gray-200">5. Cookieについて</h2>
          <p className="mb-3">本サイトはCookieを使用しています。Cookieとは、ウェブサイトがブラウザに保存する小さなテキストファイルです。Cookieにより、サイトの利便性向上やアクセス解析が可能になります。</p>
          <p>ブラウザの設定からCookieを無効にすることができますが、一部機能が正常に動作しない場合があります。</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[#0f172a] mb-4 pb-2 border-b border-gray-200">6. 外部リンクについて</h2>
          <p>本サイトには外部サイトへのリンクが含まれています。リンク先のプライバシーポリシーについては、各サイトの方針に従います。本サイトは外部サイトの内容について責任を負いません。</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[#0f172a] mb-4 pb-2 border-b border-gray-200">7. プライバシーポリシーの変更</h2>
          <p>本プライバシーポリシーは、必要に応じて変更することがあります。変更後のポリシーは本ページに掲載した時点から効力を生じます。</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[#0f172a] mb-4 pb-2 border-b border-gray-200">8. お問い合わせ</h2>
          <p>プライバシーポリシーに関するお問い合わせは、X（旧Twitter）の
            <a href="https://x.com/anime_blog_info" target="_blank" rel="noopener noreferrer" className="text-[#2563eb] hover:underline mx-1">@anime_blog_info</a>
            までDMでご連絡ください。
          </p>
        </section>

        <div className="pt-4">
          <Link href="/" className="text-[#2563eb] hover:underline text-sm">← トップページに戻る</Link>
        </div>
      </div>
    </>
  )
}
