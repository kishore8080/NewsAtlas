import type { ButtonHTMLAttributes } from "react";

type HelpButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> & {
  label?: string;
};

export default function HelpButton({
  className = "",
  label = "Get help",
  title,
  type = "button",
  ...props
}: HelpButtonProps) {
  return (
    <button
      {...props}
      aria-label={label}
      className={`help-button ${className}`}
      title={title ?? label}
      type={type}
    >
      <span aria-hidden="true">?</span>
    </button>
  );
}
