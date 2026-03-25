"use client";

import { Toaster } from "app/components/ui/sonner";

interface IClientProviderProps {
  children: React.ReactNode;
}

export const ClientProvider = ({ children }: IClientProviderProps) => {
  return (
    <>
      {children}
      <Toaster position="bottom-right" richColors />
    </>
  );
};
