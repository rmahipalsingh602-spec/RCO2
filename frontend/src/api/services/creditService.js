import { requestWithFallback } from "../client";
import { endpoints } from "../endpoints";

export const creditService = {
  getMyCredits() {
    return requestWithFallback({ urls: endpoints.myCredits });
  },

  verifyCredit(creditId) {
    return requestWithFallback({
      method: "post",
      urls: [`/admin/verify/${creditId}`]
    });
  }
};
