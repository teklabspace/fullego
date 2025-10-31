"use client";

import clsx from "clsx";

export default function Button({
  as: Component = "button",
  className,
  children,
  variant = "primary",
  ...props
}) {
  const base = "inline-flex items-center justify-center rounded-full px-5 h-12 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variants = {
    primary: "bg-black text-white hover:bg-neutral-800 focus:ring-black",
    outline:
      "border border-black/10 text-black hover:bg-black/5 focus:ring-black",
    ghost: "text-black hover:bg-black/5 focus:ring-black",
  };

  return (
    <Component className={clsx(base, variants[variant], className)} {...props}>
      {children}
    </Component>
  );
}


