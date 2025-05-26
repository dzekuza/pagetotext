import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({ children, className = "", fullWidth = false, ...props }) => (
  <button
    className={`
     px-8 py-2 rounded-[8px] font-bold text-black text-base
  border border-white/60 shadow-inner
  bg-[length:200%_100%] bg-[position:0%_0%] bg-[linear-gradient(90deg,_#95ED7F,_#DBF5DB,_#FFF)]
  transition-all duration-500 ease-in-out
  hover:bg-[position:100%_0%] hover:bg-[linear-gradient(90deg,_#136B0A,_#95ED7F,_#058B05)]
  hover:border-[rgba(77,255,32,0.8)]
  hover:shadow-[0_0_10px_0_rgba(149,237,127,0.8)]
  focus:outline-none
  disabled:opacity-50
  min-w-[44px]
  cursor-pointer
  ${fullWidth ? 'w-full' : ''}
  ${className}
    `}
    {...props}
  >
    {children}
  </button>
);

export default Button; 