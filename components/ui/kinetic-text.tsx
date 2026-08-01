import * as React from "react";

import { cn } from "@/lib/utils";

type KineticTextElement =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "p"
  | "span";

export type KineticTextProps = React.HTMLAttributes<HTMLElement> & {
  text: string;
  as?: KineticTextElement;
};

export function KineticText({
  text,
  as: Tag = "h1",
  className,
  style,
  ...props
}: KineticTextProps) {
  const mergedStyle = {
    "--hover-padding": "calc(1em / 12)",
    "--text-stroke-width": "calc(1em * 125 / 6000)",
    ...style,
  } as React.CSSProperties;

  return (
    <Tag
      data-slot="kinetic-text"
      className={cn("flex flex-wrap font-[300]", className)}
      style={mergedStyle}
      {...props}
    >
      {text.split("").map((letter, index) => (
        <span
          key={`${letter}-${index}`}
          aria-hidden="true"
          className="[-webkit-text-stroke-color:transparent] [-webkit-text-stroke-width:var(--text-stroke-width)] [transition:font-weight_0.4s,_-webkit-text-stroke-color_0.4s,_padding_0.4s] [will-change:font-weight,-webkit-text-stroke-width,padding] hover:font-[900] hover:[-webkit-text-stroke-color:currentcolor] hover:[-webkit-text-stroke-width:calc(var(--text-stroke-width)*2)] hover:[padding-inline:var(--hover-padding)] has-[+span+span:hover]:font-[400] has-[+span:hover]:font-[600] has-[+span:hover]:[padding-inline:var(--hover-padding)] motion-reduce:transition-none [:hover+&]:font-[600] [:hover+&]:[padding-inline:var(--hover-padding)] [:hover+span+&]:font-[400]"
        >
          {letter === " " ? "\u00A0" : letter}
        </span>
      ))}
      <span className="sr-only">{text}</span>
    </Tag>
  );
}
