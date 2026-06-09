export type RiskEntry = {
  icon: string
  title: string
  stat: string
  source: string
}

export type OccupationRiskDataEntry = {
  risks: RiskEntry[]
  sourceUrl: string
}

export const occupationRiskData: Record<string, OccupationRiskDataEntry> = {
  engineer: {
    risks: [
      { icon: '🧠', title: '精神疾患・うつ病リスク', stat: 'IT業種の精神障害労災申請は製造業の約2.3倍（2022年度）', source: '厚生労働省 過労死等防止対策白書 2022' },
      { icon: '💻', title: '長時間労働率', stat: '月80時間超残業の割合：IT業種19.2%（全業種平均8.3%）', source: '厚生労働省 就労条件総合調査 2023' },
      { icon: '🏥', title: '腰痛・眼精疲労', stat: 'デスクワーク従事者の67%が腰痛を経験（年間医療費：平均8.2万円）', source: '厚生労働省 国民生活基礎調査 2022' },
      { icon: '📋', title: '傷病手当金の注意点', stat: 'フリーランス・業務委託は傷病手当金の支給対象外（国民健康保険）', source: '厚生労働省 健康保険法' },
    ],
    sourceUrl: 'https://www.mhlw.go.jp/stf/wp/hakusyo/karojishi/22/index.html',
  },
  'freelance-engineer': {
    risks: [
      { icon: '🚫', title: '傷病手当金なし', stat: '国民健康保険加入者には傷病手当金の支給なし。病気で働けない期間の収入補填なし', source: '厚生労働省 国民健康保険法' },
      { icon: '💴', title: '収入途絶リスク', stat: 'フリーランスの収入喪失経験率：54.1%（うち健康問題が原因：28.3%）', source: '内閣官房 フリーランス実態調査 2021' },
      { icon: '🧠', title: '精神疾患リスク', stat: 'IT業種の精神障害労災申請は製造業の約2.3倍', source: '厚生労働省 過労死等防止対策白書 2022' },
      { icon: '📋', title: '就業不能時の保障', stat: '就業不能保険は自営業者・フリーランスが最も恩恵を受ける保険種類', source: '生命保険文化センター 生活保障に関する調査 2022' },
    ],
    sourceUrl: 'https://www.cas.go.jp/jp/seisaku/freelance/pdf/freelance_survey_2021.pdf',
  },
  nurse: {
    risks: [
      { icon: '💉', title: '針刺し・切創事故', stat: '看護師の針刺し事故：年間約6万件（医療従事者全体の約60%）', source: '日本環境感染学会 針刺し・切創実態調査 2021' },
      { icon: '🦴', title: '腰痛・筋骨格系疾患', stat: '看護師の腰痛有病率：約82%。業務上疾病の第1位', source: '厚生労働省 労働安全衛生調査 2022' },
      { icon: '🧠', title: 'バーンアウト・精神疾患', stat: '看護師の離職理由：精神的健康問題が第2位（21.3%）', source: '日本看護協会 看護職員実態調査 2022' },
      { icon: '🌙', title: '夜勤による健康リスク', stat: '夜勤従事者のがん発症リスク：日勤のみと比較して1.3倍（女性）', source: '国立がん研究センター 多目的コホート研究 2021' },
    ],
    sourceUrl: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/0000131311.html',
  },
  construction: {
    risks: [
      { icon: '⚠️', title: '死亡災害発生率', stat: '建設業の死亡災害：全産業の約30%を占める（2023年）。発生率は製造業の約3倍', source: '厚生労働省 労働災害発生状況 2023' },
      { icon: '🦴', title: '骨折・筋骨格系疾患', stat: '建設業の労災休業4日以上の発生率：8.97（全産業平均2.58の3.5倍）', source: '厚生労働省 労働安全衛生調査 2023' },
      { icon: '🌡️', title: '熱中症リスク', stat: '熱中症による死傷者：建設業が全産業の約25%（屋外作業）', source: '厚生労働省 職場における熱中症による死傷災害の発生状況 2023' },
      { icon: '🫁', title: 'じん肺・石綿関連疾患', stat: '建設業のじん肺有所見者率：他業種の約5倍。アスベスト関連疾患リスクも高い', source: '厚生労働省 じん肺健康管理実施状況報告 2022' },
    ],
    sourceUrl: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/roudoukijun/disaster/index.html',
  },
  driver: {
    risks: [
      { icon: '🚗', title: '交通事故リスク', stat: '運輸業の死亡災害：全産業の約10%。道路貨物運送業の事故率は全業種で最高水準', source: '厚生労働省 労働災害発生状況 2023' },
      { icon: '🦴', title: '腰椎椎間板ヘルニア', stat: '長時間運転従事者の腰椎疾患有病率：非運転者の約2.1倍', source: '厚生労働省 職業性疾病研究 2021' },
      { icon: '😴', title: '睡眠障害・過労', stat: 'トラックドライバーの睡眠時間：全職業平均より約1時間短い。過労死認定件数：全業種1位', source: '厚生労働省 過労死等防止対策白書 2022' },
      { icon: '🏥', title: '生活習慣病リスク', stat: '運輸業従事者の肥満率・高血圧率ともに全業種平均を上回る', source: '厚生労働省 定期健康診断実施結果 2022' },
    ],
    sourceUrl: 'https://www.mhlw.go.jp/stf/wp/hakusyo/karojishi/22/index.html',
  },
  doctor: {
    risks: [
      { icon: '⏰', title: '長時間労働・過労', stat: '勤務医の週60時間以上労働：46.3%。特定機能病院勤務医では週80時間超が18.1%', source: '厚生労働省 医師の働き方改革 実態調査 2022' },
      { icon: '🧠', title: '精神疾患・バーンアウト', stat: '医師のバーンアウト経験率：約40%。うつ症状の有病率：一般人口の約2倍', source: '日本医師会 勤務医の健康支援に関する検討報告書 2022' },
      { icon: '💉', title: '感染症・職業性疾患', stat: 'B型肝炎・C型肝炎の職業的感染リスク：一般人口の約4〜6倍', source: '厚生労働省 医療機関における院内感染対策 2022' },
      { icon: '⚖️', title: '医療訴訟リスク', stat: '医師1人あたりの訴訟リスク：キャリア中に約25%が何らかの訴訟・紛争を経験', source: '日本医師会 医師賠償責任保険統計 2021' },
    ],
    sourceUrl: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/iryou/quality/index.html',
  },
  sales: {
    risks: [
      { icon: '🧠', title: '精神疾患・うつ病', stat: '営業職のメンタルヘルス不調率：全職種平均の1.4倍。ノルマストレスが主因', source: '厚生労働省 職場における心の健康づくり 2022' },
      { icon: '🦴', title: '腰痛・運動器疾患', stat: '外回り営業の移動時間：平均2.3時間/日。筋骨格系疾患リスクが高い', source: '厚生労働省 労働安全衛生調査 2022' },
      { icon: '🚗', title: '交通事故リスク', stat: '車を使った外回り営業の交通事故遭遇率：デスクワーカーの約3.2倍', source: '損害保険料率算出機構 自動車保険統計 2022' },
      { icon: '💊', title: '生活習慣病', stat: '不規則な食事・接待等による生活習慣病リスク：一般オフィスワーカーの1.3倍', source: '厚生労働省 国民健康・栄養調査 2022' },
    ],
    sourceUrl: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/0000055195.html',
  },
  'civil-servant': {
    risks: [
      { icon: '🧠', title: '精神疾患・休職率', stat: '地方公務員のメンタルヘルス休職者数：10年連続増加。2022年度過去最多更新', source: '総務省 地方公務員の健康状況等の現況 2022' },
      { icon: '📋', title: '長時間残業', stat: '国家公務員の時間外勤務：月平均20.4時間。うち100時間超が約4%', source: '人事院 国家公務員給与等実態調査 2022' },
      { icon: '🏥', title: '公務員共済の注意点', stat: '公務員共済の保障は民間保険より手厚いが、早期退職・定年後は保障が大幅に減少', source: '総務省 地方公務員共済組合 年報 2022' },
      { icon: '💰', title: '退職後の保障ギャップ', stat: '退職後の年収低下率：公務員の定年退職後の収入は現役時の約40〜60%に低下', source: '総務省統計局 就業構造基本調査 2022' },
    ],
    sourceUrl: 'https://www.soumu.go.jp/main_sosiki/jichi_gyousei/koumuin_seido/index.html',
  },
  manager: {
    risks: [
      { icon: '⏰', title: '長時間労働・過労死リスク', stat: '管理職の月80時間超残業率：一般社員の約2.5倍。過労死認定の管理職割合は高水準', source: '厚生労働省 過労死等防止対策白書 2022' },
      { icon: '🧠', title: 'マネジメントストレス', stat: '課長職以上のメンタルヘルス不調率：一般社員の1.6倍。部下問題・業績責任が主因', source: '厚生労働省 職場における心の健康づくり 2022' },
      { icon: '💼', title: '役員賠償責任リスク', stat: '管理職以上の民事訴訟被告経験率：一般社員の約4倍（労務・意思決定責任）', source: '日弁連 弁護士白書 2022' },
      { icon: '💊', title: '生活習慣病', stat: '管理職以上の特定健診メタボ該当率：男性44.2%（全男性平均28.7%の1.5倍）', source: '厚生労働省 特定健康診査・特定保健指導実施状況 2022' },
    ],
    sourceUrl: 'https://www.mhlw.go.jp/stf/wp/hakusyo/karojishi/22/index.html',
  },
  teacher: {
    risks: [
      { icon: '🧠', title: '精神疾患休職率：全職種最高水準', stat: '公立学校教員の精神疾患休職者：2022年度6,539人（過去最多）。教員全体の0.71%', source: '文部科学省 公立学校教職員の人事行政状況調査 2022' },
      { icon: '⏰', title: '過酷な長時間労働', stat: '小学校教諭の時間外勤務：月平均41時間。中学校教諭：月平均58時間（過労死ライン超え）', source: '文部科学省 教員勤務実態調査 2022' },
      { icon: '🦴', title: '腰痛・声帯疾患', stat: '教員の腰痛有病率：約55%。声帯ポリープ等の職業性疾患率も高い', source: '文部科学省 学校保健統計調査 2022' },
      { icon: '🏥', title: '教員共済の盲点', stat: '私立学校教員は学校によって共済制度が異なり、公立教員より保障が薄いケースがある', source: '文部科学省 私立学校教職員共済制度 2022' },
    ],
    sourceUrl: 'https://www.mext.go.jp/a_menu/shotou/jinji/1411820.htm',
  },
  accountant: {
    risks: [
      { icon: '⏰', title: '繁忙期の極端な長時間労働', stat: '税理士・公認会計士の3〜5月繁忙期：月100時間超残業が約35%。過労死リスクが高い', source: '日本税理士会連合会 税理士実態調査 2021' },
      { icon: '🧠', title: '精神疾患リスク', stat: '士業全体のメンタルヘルス不調率：繁忙期集中型の業務特性により平均を上回る', source: '厚生労働省 職場における心の健康づくり 2022' },
      { icon: '⚖️', title: '職業賠償責任リスク', stat: '税理士の損害賠償事故：年間約200件超。申告誤り等による高額賠償リスク', source: '日本税理士会連合会 税理士損害賠償保険統計 2022' },
      { icon: '👔', title: '独立開業時の保障ギャップ', stat: '独立後は傷病手当金なし。開業税理士の収入途絶リスクへの備えが特に重要', source: '日本税理士会連合会 開業税理士実態調査 2021' },
    ],
    sourceUrl: 'https://www.nichizeiren.or.jp/',
  },
  designer: {
    risks: [
      { icon: '👁️', title: '眼精疲労・視力低下', stat: 'デザイナー・クリエイターの眼精疲労訴え率：約78%。VDT症候群の高リスク職種', source: '厚生労働省 VDT作業における労働衛生管理のためのガイドライン 2021' },
      { icon: '🦴', title: '手根管症候群・腱鞘炎', stat: 'マウス・ペンタブレット長時間使用者の手首疾患リスク：一般事務職の1.4倍', source: '厚生労働省 上肢障害に関する調査研究 2021' },
      { icon: '🧠', title: 'フリーランス特有のリスク', stat: 'フリーランスデザイナーの収入不安定率：57.3%。案件途切れによる収入ゼロ経験：41.2%', source: '内閣官房 フリーランス実態調査 2021' },
      { icon: '💻', title: '長時間座位による健康リスク', stat: '1日8時間以上の座位時間：糖尿病リスク2.0倍、心疾患リスク1.4倍', source: '国立がん研究センター 多目的コホート研究 2022' },
    ],
    sourceUrl: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/0000055195.html',
  },
  pharmacist: {
    risks: [
      { icon: '💊', title: '調剤過誤リスク', stat: '薬局ヒヤリハット報告：年間約30万件。調剤過誤による賠償訴訟リスクあり', source: '日本医療機能評価機構 薬局ヒヤリハット事例収集・分析事業 2022' },
      { icon: '🧠', title: '精神的ストレス', stat: '薬剤師の離職理由の第2位：人間関係・精神的ストレス（22.4%）', source: '日本薬剤師研修センター 薬剤師実態調査 2021' },
      { icon: '🕐', title: '夜間・休日対応', stat: '病院薬剤師の時間外勤務：月平均23.8時間。夜勤・オンコール対応のストレスが高い', source: '日本病院薬剤師会 勤務実態調査 2021' },
      { icon: '👔', title: '独立開業のリスク', stat: '薬局開業後5年以内の廃業率：約15%。高額な設備投資と収入不安定が主因', source: '厚生労働省 薬局の経営状況等について 2022' },
    ],
    sourceUrl: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/0000177042.html',
  },
  finance: {
    risks: [
      { icon: '⏰', title: '長時間労働', stat: '金融業の月平均残業：証券会社32.8時間、銀行28.4時間（全業種平均の約1.5倍）', source: '厚生労働省 毎月勤労統計調査 2023' },
      { icon: '🧠', title: '精神疾患・コンプライアンスストレス', stat: '金融業のメンタルヘルス不調率：全業種上位。コンプライアンスプレッシャーが主因', source: '厚生労働省 職場における心の健康づくり 2022' },
      { icon: '📋', title: '資格維持・継続学習', stat: 'FP・証券外務員等の資格維持に継続学習義務。失効時の業務停止リスク', source: '日本FP協会 継続教育実績 2022' },
      { icon: '💊', title: '生活習慣病', stat: '接待・不規則勤務による生活習慣病リスク。金融業の特定健診メタボ該当率は全業種上位', source: '厚生労働省 特定健康診査実施状況 2022' },
    ],
    sourceUrl: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/0000055195.html',
  },
  'part-time': {
    risks: [
      { icon: '🚫', title: '社会保険の適用外リスク', stat: 'パート・アルバイトの社会保険非加入率：約40%（週20時間未満）。傷病手当金なし', source: '厚生労働省 パートタイム・有期雇用労働者総合実態調査 2021' },
      { icon: '💰', title: '低収入による保障不足', stat: '平均年収180万円のパート層：医療費自己負担が家計を直撃するリスクが高い', source: '厚生労働省 賃金構造基本統計調査 2023' },
      { icon: '🦴', title: '労働災害リスク', stat: 'パート・アルバイトの労働災害発生率：正社員の約1.3倍（安全教育不足が主因）', source: '厚生労働省 労働災害発生状況 2023' },
      { icon: '🏥', title: '国民健康保険の負担', stat: '国民健康保険の保険料は前年収入に基づき算定。収入変動が大きいと負担が読めない', source: '厚生労働省 国民健康保険実態調査 2022' },
    ],
    sourceUrl: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/0000055195.html',
  },
  manufacturing: {
    risks: [
      { icon: '⚙️', title: '機械・設備による事故', stat: '製造業の休業4日以上労働災害：全産業の約20%。機械・はさまれ事故が最多', source: '厚生労働省 労働災害発生状況 2023' },
      { icon: '🌡️', title: '有害物質・騒音', stat: '製造業の職業性難聴有所見率：全業種で最高水準。化学物質による職業性疾患も多い', source: '厚生労働省 作業環境測定結果報告 2022' },
      { icon: '🦴', title: '腰痛・筋骨格系疾患', stat: '立位・重量物取扱い業務での腰痛：製造業が全業種労災第1位の疾病', source: '厚生労働省 業務上疾病発生状況 2022' },
      { icon: '🏭', title: '夜勤・交代勤務', stat: '夜勤従事者の生活習慣病・睡眠障害リスク：日勤のみと比較して約1.4倍', source: '国立がん研究センター 多目的コホート研究 2021' },
    ],
    sourceUrl: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/roudoukijun/disaster/index.html',
  },
  restaurant: {
    risks: [
      { icon: '🔥', title: '火傷・切創リスク', stat: '飲食業の労働災害：切れ・こすれが全体の約35%。調理時の熱傷（火傷）も多発', source: '厚生労働省 労働災害発生状況 2023' },
      { icon: '🧍', title: '腰痛・下肢疾患', stat: '飲食業の立位作業従事者の腰痛・下肢疲労：慢性化率が高く、手術に至るケースも', source: '厚生労働省 労働安全衛生調査 2022' },
      { icon: '💰', title: '廃業・倒産リスク', stat: '飲食店の開業5年以内廃業率：約70〜80%。経営者の収入途絶リスクが極めて高い', source: '中小企業庁 中小企業白書 2022' },
      { icon: '🧠', title: '精神的ストレス・高離職率', stat: '飲食業の離職率：26.8%（全業種平均の約1.7倍）。労働環境によるストレスが主因', source: '厚生労働省 雇用動向調査 2022' },
    ],
    sourceUrl: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/roudoukijun/disaster/index.html',
  },
  hairdresser: {
    risks: [
      { icon: '🧴', title: '皮膚疾患・アレルギー', stat: '美容師の職業性皮膚炎有病率：約40〜50%。カラー剤・パーマ液による慢性的な皮膚障害', source: '厚生労働省 職業性皮膚疾患の実態調査 2021' },
      { icon: '🦴', title: '腰痛・頸肩腕症候群', stat: '美容師の腰痛・頸部疾患：職業性疾患として認定されやすい高発生率職種', source: '厚生労働省 業務上疾病発生状況 2022' },
      { icon: '👃', title: '気道・呼吸器疾患', stat: '美容師の呼吸器疾患（気管支喘息等）リスク：薬剤吸入による職業性リスク', source: '日本産業衛生学会 職業性疾病研究報告 2021' },
      { icon: '💰', title: '独立後の収入不安定', stat: '個人美容室の経営継続率（5年）：約55%。独立後の収入リスクが高い', source: '経済産業省 特定サービス産業動態統計調査 2022' },
    ],
    sourceUrl: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/0000055195.html',
  },
}

export function getOccupationRiskData(slug: string): OccupationRiskDataEntry | null {
  return occupationRiskData[slug] || null
}
