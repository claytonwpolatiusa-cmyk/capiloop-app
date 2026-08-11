import AsyncStorage from "@react-native-async-storage/async-storage";

const PENDING_CHECKOUT_OFFER_KEY = "capiloop-pending-checkout-offer";

/** Stores the minimal, non-sensitive route context needed after authentication. */
export async function savePendingCheckoutOffer(offerId: string) {
  if (!offerId.trim()) return;
  await AsyncStorage.setItem(PENDING_CHECKOUT_OFFER_KEY, offerId);
}

/** Reads and clears the pending checkout context to avoid re-running it later. */
export async function consumePendingCheckoutOffer(): Promise<string | null> {
  const offerId = await AsyncStorage.getItem(PENDING_CHECKOUT_OFFER_KEY);
  await AsyncStorage.removeItem(PENDING_CHECKOUT_OFFER_KEY);
  return offerId?.trim() || null;
}
