import React from "react";

export function LoadingSpinner({ tailwindSize }: { tailwindSize?: string }) {
  return (
    <div className="flex  items-center  justify-center">
      <div
        className={`
         ${tailwindSize ? tailwindSize : "h-8 w-8"}
          motion-reduce:animate-[spin_1.5s_linear_infinite]" + inline-block animate-spin rounded-full
         border-4 border-solid border-current border-r-transparent align-[-0.125em]
`}
        role="status"
      >
        <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(40,40,40,0)]">
          Loading...
        </span>
      </div>
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="flex h-full items-center  justify-center">
      <LoadingSpinner tailwindSize={"h-16 w-16 "} />
    </div>
  );
}
