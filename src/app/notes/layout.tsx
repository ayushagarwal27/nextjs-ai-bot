import React from "react";
import Navbar from "./NavBar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Navbar />
      <main className="max-w-7xl p-4 m-auto">{children}</main>
    </>
  );
};

export default Layout;
