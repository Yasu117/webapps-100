'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";
import { OrderData } from './types';

export async function analyzeImage(formData: FormData): Promise<OrderData | { error: string; details?: any }> {
  const file = formData.get('file') as File;

  if (!file) {
    return { error: 'ファイルがアップロードされていません' };
  }

  // 環境変数を直接取得
  // const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const apiKey = "AIzaSyDAjCJWwghwY3_UCdrh2IL_NlLmMYKBQZk";

  if (!apiKey) {
    console.error("API Key is missing in actions.ts");
    return { error: 'Gemini APIキーが設定されていません (サーバー側)' };
  }

  // デバッグ用: キーの確認（セキュリティのため先頭のみ）
  console.log(`Initializing Gemini with key: ${apiKey.substring(0, 5)}...`);

  // ファイルをArrayBufferとして読み込む
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64 = buffer.toString('base64');

  // クライアントを直接初期化
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash", // 2025年12月現在の最新標準モデル
    generationConfig: {
      responseMimeType: "application/json"
    }
  });

  const prompt = `
    この画像を日本の商習慣に基づく「注文書（発注書）」として解析し、指定のJSON形式のみを出力してください。説明文やコメントは一切出力せず、JSONオブジェクトのみ返してください。

    # 共通ルール
    - 画像は注文書（発注書）として解釈すること。
    - 記載がない項目は、文字列なら ""（空文字）、数値なら null を入れること。
    - 数値はカンマや通貨記号（円、¥）、単位を除去した半角数字にすること。
    - 推測による補完は禁止。書いていない情報を勝手に埋めないこと。
    - 日本語・英語・略語・全角/半角のゆらぎを適切に判別して項目にマッピングすること。
    - 回答は必ず UTF-8 の JSON オブジェクトのみとし、余計なテキストは一切出力しないこと。

    # 1. customer_name（発注元：注文している側）
    - 注文書の中で「注文する側」「発注する側」にあたる名称を抽出する。
    - 「発注元」「依頼主」「注文者」「ご注文者」などのラベルがある場合は、その値を優先する。
    - ラベルがなくても、本文の文脈から判断する：
      - 「下記の通り注文いたします」「注文申し上げます」などの文を出している側が発注元。
    - 宛先として書かれている会社（To:）とは逆側の会社を発注元とする。
    - 「御中」「様」「殿」などの敬称は取り除き、名称部分のみを抽出する。
    - 判断がつかない場合は "" とする。

    "customer_name": "文字列"

    # 2. supplier_name（発注先：注文を受ける側）
    - 注文書の宛先（注文を受ける側）の会社名・名称を抽出する。
    - 「○○御中」「宛」などで示されている名称は supplier_name の有力候補とする。
    - タイトル付近に「○○御中」と大きく書かれている会社は、原則 supplier_name とする。
    - customer_name と同じ名称は supplier_name に入れない。
    - 「御中」「様」「殿」などの敬称は取り除き、名称部分のみを抽出する。
    - 判断がつかない場合は "" とする。

    "supplier_name": "文字列"

    # 3. delivery_date（納期）
    - 「納期」「納入期日」「納入期限」「引渡日」「納品日」「お届け日」など、納品・引渡しの締切や予定日を探し、その日付を抽出する。
    - 「工期」「工事期間」「施工期間」「工程」などは納期には含めない。
    - 日付表記は「2025年4月1日」「H28.11.7」「28/11/7」「2016/11/07」などの場合でも、必ず YYYY-MM-DD 形式に正規化する。
    - 該当する日付がどこにも見つからない場合は "" とする（今日の日付などで補完してはいけない）。

    "delivery_date": "YYYY-MM-DD"

    # 4. items（明細行）
    - 注文書の明細表に記載されているすべての行を漏れなく抽出する（MECE：重複や取りこぼしなし）。
    - 商品・工事・作業費・諸経費・値引き・割引など、金額に関わる行はすべて対象とする。
    - ヘッダー行（品番・品名・数量などの見出し）や、合計行（小計・合計・税込合計など）は items に含めない。

    各行について、次の項目を抽出する。

    ## 4-1. product_code
    - 「品番」「型番」「型式」「品番・型式」「NO」などに該当する値を抽出する。
    - 行にコードが明示されていない場合は "" とする。

    ## 4-2. product_name
    - 「品名」「商品名」「名称」「摘要」「内容」「工事名」「作業名」など、その行の内容を表すテキストを抽出する。
    - 「値引き」「割引」「諸経費」なども、そのまま product_name として抽出する。
    - 複数行にまたがる説明は、可能な範囲で1つの文字列に結合してよい。

    ## 4-3. quantity
    - 「数量」「数」「個数」「台数」「口数」「式」「セット」「㎡」「m」「kg」など、数量を示す部分から数値だけを抽出する（単位は含めない）。
    - 数量が完全に書かれていない、または判別不能な場合は null とする。
    - ただし、行の内容が「値引き」「割引」の場合で、数量が書かれていないが単価や金額のみ記載があるときは、quantity を 1 とする。

    ## 4-4. price（行の合計金額）
    - その行の「金額」「小計」に相当する金額を price として抽出する。
    - 「単価」と「金額」の両方がある場合は、行としての合計金額（「金額」欄）を price に入れる。
    - 「金額」欄が空欄だが、「単価」と「数量」が両方記載されている場合は、price = 単価 × 数量 として計算してよい。
    - 行の内容が「値引き」「割引」の場合は、以下のルールで必ずマイナス金額にすること：
      - 「▲1,000」「△1,000」「-1,000」「▲ 1,000円」などは -1000 とする。
      - 「値引き 1,000」「割引 1,000円」などマイナス記号がない場合でも、値引き・割引行であれば -1000 とする。
      - 金額欄が空で単価だけが「10750」のように記載されている場合でも、値引き・割引行であれば -10750 を price とする。
    - 金額が完全に書かれておらず、単価・数量からも合理的に判断できない場合のみ price を null とする。
    - 0 円ではなく null を使うのは「書かれていない」場合のみであり、値引き行などで 0 にしてはいけない。

    "items": [
      {
        "product_code": "文字列または空文字",
        "product_name": "文字列",
        "quantity": 数値または null,
        "price": 数値または null
      }
    ]

    # 5. total_amount（合計金額）
    - 「合計」「合計金額」「発注金額」「ご請求金額」「税込合計」「お支払合計」など、注文全体の合計金額に該当する数値を抽出する。
    - 消費税や送料込み／別が明記されている場合でも、次の優先順位で金額を選択する：
      1. 「税込合計」「合計金額（税込）」など、税込の最終合計
      2. 上記がない場合は、最も外側の「合計」「発注金額」など
    - 明細行の合計と一致しない場合でも、書類上の合計金額をそのまま total_amount に入れる（不一致の理由は出力しない）。
    - 合計金額がどこにも明記されていない場合は null とする。

    "total_amount": 数値または null

    # 出力フォーマット
    以下の形式の JSON オブジェクトのみを出力すること。コメントや末尾カンマは禁止。

    {
      "customer_name": "文字列",
      "supplier_name": "文字列",
      "delivery_date": "YYYY-MM-DD",
      "total_amount": 0,
      "items": [
        {
          "product_code": "文字列",
          "product_name": "文字列",
          "quantity": 0,
          "price": 0
        }
      ]
    }
  `;

  try {
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64,
          mimeType: file.type
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();

    const data = JSON.parse(text);

    // データの正規化
    if (!data.items || !Array.isArray(data.items)) {
      data.items = [];
    }

    // AIのレスポンス（シンプル版）をアプリのデータ構造（詳細版）にマッピング
    const mappedData: OrderData = {
      // 必須フィールドのデフォルト値
      order_number: '',
      issue_date: new Date().toISOString().split('T')[0],

      // customer_name を orderer_name にマッピング
      orderer_name: data.customer_name || '',
      orderer_address: '',
      orderer_contact: '',

      // supplier_name をマッピング
      supplier_name: data.supplier_name || '',
      supplier_address: '',
      supplier_contact: '',

      delivery_date: data.delivery_date || new Date().toISOString().split('T')[0],
      delivery_place: '',
      delivery_method: '',
      payment_terms: '',

      subtotal_amount: 0,
      tax_amount: 0,
      total_amount: data.total_amount || 0,

      remarks: '',

      items: data.items.map((item: any) => ({
        product_code: item.product_code || '',
        product_name: item.product_name || '',
        spec: '', // シンプル版にはないため空
        quantity: item.quantity || 0, // nullの場合は0
        price: item.price || 0        // nullの場合は0
      }))
    };

    return mappedData;
  } catch (error: any) {
    console.error("AI Analysis Error:", error);
    // エラーの詳細を返す
    return {
      error: `AI解析エラー: ${error.message || '不明なエラー'}`,
      details: JSON.stringify(error, Object.getOwnPropertyNames(error))
    };
  }
}

export async function checkEnvVars() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  return {
    hasGeminiKey: !!apiKey,
    keyPrefix: apiKey ? apiKey.substring(0, 5) : 'None'
  };
}
