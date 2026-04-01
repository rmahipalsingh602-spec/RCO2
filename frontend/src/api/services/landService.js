import { requestWithFallback } from "../client";
import { endpoints } from "../endpoints";

export const landService = {
  getMyLand() {
    return requestWithFallback({ urls: endpoints.myLand });
  },

  addLand(payload) {
    return requestWithFallback({
      method: "post",
      urls: endpoints.addLand,
      data: {
        location_name: payload.locationName,
        area_acres: Number(payload.area),
        farming_type: payload.farmingType
      }
    });
  }
};
