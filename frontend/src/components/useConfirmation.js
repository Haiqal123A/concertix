import { createContext, useContext } from "react";

export const ConfirmationContext = createContext(null);

export function useConfirmation() {
  const confirm = useContext(ConfirmationContext);
  if (!confirm) {
    throw new Error(
      "useConfirmation must be used within a ConfirmationProvider"
    );
  }
  return confirm;
}
