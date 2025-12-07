export type OrderItem = {
    product_code: string;
    product_name: string;
    spec: string; // 仕様・摘要
    quantity: number;
    price: number;
};

export type OrderData = {
    id?: number;
    created_at?: string;

    // 基本情報
    order_number: string; // 発注書番号
    issue_date: string;   // 発行日

    // 発注元（Customer）
    orderer_name: string;    // 会社名
    orderer_address: string; // 住所
    orderer_contact: string; // 担当者

    // 発注先（Supplier）
    supplier_name: string;    // 会社名
    supplier_address: string; // 住所
    supplier_contact: string; // 担当者

    // 納入・支払い
    delivery_date: string;   // 納入期限
    delivery_place: string;  // 納入場所
    delivery_method: string; // 納品方法
    payment_terms: string;   // 支払い条件

    // 金額
    subtotal_amount: number; // 小計
    tax_amount: number;      // 消費税
    total_amount: number;    // 合計金額

    // その他
    remarks: string; // 備考

    items: OrderItem[];
};
