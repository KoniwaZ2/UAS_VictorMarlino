import React from "react";

const LoadingSpinner = ({ message = "Memuat..." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        <div
          className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-primary-400 rounded-full animate-spin"
          style={{ animationDirection: "reverse", animationDuration: "0.75s" }}
        ></div>
      </div>
      <p className="mt-4 text-gray-600 font-semibold animate-pulse">
        {message}
      </p>
    </div>
  );
};

export default LoadingSpinner;
