console.error("[DEBUG] requestOpenai function was triggered!");
import { NextRequest, NextResponse } from "next/server";
import { getServerSideConfig } from "../config/server";
import { OPENAI_BASE_URL, ServiceProvider } from "../constant";
import { getModelProvider, isModelNotavailableInServer } from "../utils/model";

const serverConfig = getServerSideConfig();

export async function requestOpenai(req: NextRequest) {
  const controller = new AbortController();

  const isAzure = req.nextUrl.pathname.includes("azure/deployments");

  var authValue,
    authHeaderName = "";
  if (isAzure) {
    authValue =
      req.headers
        .get("Authorization")
        ?.trim()
        .replaceAll("Bearer ", "")
        .trim() ?? "";
    authHeaderName = "api-key";
  } else {
    authValue = "Bearer pk-aQHkcjeXQskLhIQjhGzoZDzgEJinuTFciaBkzyaZmGCzGAxy"; // <-- Вставь сюда свой ключ
    authHeaderName = "X-API-Key";
  }

  let path = `${req.nextUrl.pathname}`.replaceAll("/api/openai/", "");

  let baseUrl =
    (isAzure ? serverConfig.azureUrl : serverConfig.baseUrl) || OPENAI_BASE_URL;

  if (!baseUrl.startsWith("http")) {
    baseUrl = `https://${baseUrl}`;
  }

  if (baseUrl.endsWith("/")) {
    baseUrl = baseUrl.slice(0, -1);
  }

  console.error("[Base Url]", baseUrl);
const fetchUrl = `${baseUrl}/${path}`;
console.error("[Full Request URL]", fetchUrl);
console.error("[DEBUG] requestOpenai function called");

  const fetchOptions: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "X-API-Key": authValue,
    },
    method: req.method,
    body: req.body,
    redirect: "manual",
    // @ts-ignore
    duplex: "half",
    signal: controller.signal,
  };

  try {
    const res = await fetch(fetchUrl, fetchOptions);
    return res;
  } finally {
    controller.abort(); // <-- Правильный способ отменить AbortController
  }
}
