import React from "react";

const ErrorMessage: React.FC<{ error: string }> = ({ error }) => (
  <span className="text-red-600 font-semibold text-center">{error}</span>
);

export default ErrorMessage;
