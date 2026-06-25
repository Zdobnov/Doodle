import type { ReactNode } from 'react';

type MainLayoutProps = {
  children: ReactNode;
};

export const MainLayout = ({ children }: MainLayoutProps) => (
  <div className="main-layout">{children}</div>
);
