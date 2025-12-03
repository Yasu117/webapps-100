import { GoogleGenerativeAI } from "@google/generative-ai";

const getApiKey = () => {
    // ユーザー指定の GEMINI_API_KEY を優先しつつ、
    // 以前設定した GOOGLE_API_KEY にもフォールバック対応
    return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
};

export const getGeminiClient = () => {
    const apiKey = getApiKey();
    if (!apiKey) {
        return null;
    }
    return new GoogleGenerativeAI(apiKey);
};

export const getRequirementsModel = () => {
    const client = getGeminiClient();
    if (!client) {
        return null;
    }
    // モデルは gemini-2.0-flash を指定（最新の推奨モデル）
    return client.getGenerativeModel({ model: "gemini-2.0-flash" });
};

export const getLegalModel = () => {
    const client = getGeminiClient();
    if (!client) {
        return null;
    }
    // 契約書チェック用も同じ最新モデルを使用
    return client.getGenerativeModel({ model: "gemini-2.0-flash" });
};
