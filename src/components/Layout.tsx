import React, { PropsWithChildren } from "react";

function Layout(props: PropsWithChildren) {
  return (
    <div>
      {" "}
      <main className="flex h-screen justify-center bg-gray-800   ">
        <div className="h-full w-full overflow-y-scroll border-x border-gray-400  md:max-w-2xl">
          {props.children}
        </div>{" "}
      </main>
    </div>
  );
}

export default Layout;
