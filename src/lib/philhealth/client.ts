export type EligibilityStatus = "ELIGIBLE" | "INELIGIBLE" | "PENDING";

export interface EligibilityResponse {
  status: EligibilityStatus;
  memberCategory: string;
  reason?: string;
  trackingNumber: string;
}

export const philhealthMock = {
  checkEligibility: async (philhealthId: string): Promise<EligibilityResponse> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simple mock logic
    if (philhealthId.startsWith("1")) {
      return {
        status: "ELIGIBLE",
        memberCategory: "Private Sector",
        trackingNumber: `TRACK-${Math.floor(Math.random() * 1000000)}`,
      };
    } else if (philhealthId.startsWith("2")) {
      return {
        status: "ELIGIBLE",
        memberCategory: "Government Sector",
        trackingNumber: `TRACK-${Math.floor(Math.random() * 1000000)}`,
      };
    } else if (philhealthId.startsWith("9")) {
      return {
        status: "INELIGIBLE",
        memberCategory: "Unknown",
        reason: "Missing contributions for the last 3 months.",
        trackingNumber: `TRACK-${Math.floor(Math.random() * 1000000)}`,
      };
    }

    return {
      status: "PENDING",
      memberCategory: "Unknown",
      reason: "Further documentation required.",
      trackingNumber: `TRACK-${Math.floor(Math.random() * 1000000)}`,
    };
  },

  submitClaim: async (claimData: any) => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return {
      success: true,
      tcn: `TCN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      message: "Claim submitted successfully to PhilHealth.",
    };
  },
};
