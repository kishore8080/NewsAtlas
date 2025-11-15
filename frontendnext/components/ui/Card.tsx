import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className = "", hover = false }: CardProps) {
  return (
    <div
      className={`bg-white rounded-lg shadow-md border border-gray-200 p-6 ${
        hover ? "hover:shadow-lg transition-shadow cursor-pointer" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

