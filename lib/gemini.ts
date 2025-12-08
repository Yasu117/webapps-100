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
    // モデルは gemini-flash-latest を指定（利用可能リストに存在する安定版エイリアス）
    return client.getGenerativeModel({ model: "gemini-flash-latest" });
};

export const getLegalModel = () => {
    const client = getGeminiClient();
    if (!client) {
        return null;
    }
    // 契約書チェック用も同じモデルを使用
    return client.getGenerativeModel({ model: "gemini-flash-latest" });
};
