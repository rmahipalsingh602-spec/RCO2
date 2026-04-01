import { requestWithFallback } from "../client";
import { endpoints } from "../endpoints";

export const earningsService = {
  getMyEarnings() {
    return requestWithFallback({ urls: endpoints.myEarnings });
  }
};
