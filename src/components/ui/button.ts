const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-sans transition-[background-color,box-shadow,transform] duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60";

const variants = {
  primary: "bg-primary text-white shadow-[0_6px_16px_rgb(37_99_235/0.25)] hover:bg-primary-hover",
  danger: "bg-danger text-white shadow-[0_6px_16px_rgb(234_76_70/0.25)] hover:bg-[#d93f39]",
} as const;

const sizes = {
  md: "h-11 px-5 text-[15px] sm:h-[52px] sm:px-6 sm:text-lg",
  lg: "h-12 px-6 text-base sm:h-14 sm:px-8 sm:text-lg md:h-[66px]",
} as const;

export function buttonClass(variant: keyof typeof variants = "primary", size: keyof typeof sizes = "md", extra = "") {
  return `${base} ${variants[variant]} ${sizes[size]} ${extra}`;
}
