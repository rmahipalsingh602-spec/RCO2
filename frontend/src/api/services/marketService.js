import { requestWithFallback } from "../client";
import { endpoints } from "../endpoints";

export const marketService = {
  getListings() {
    return requestWithFallback({ urls: endpoints.marketList });
  },

  buyCredits(payload) {
    return requestWithFallback({
      method: "post",
      urls: endpoints.marketBuy,
      data: {
        carbon_credit_id: payload.carbonCreditId,
        buyer_id: payload.buyerId,
        credits: Number(payload.credits),
        amount: Number(payload.amount)
      }
    });
  }
};
