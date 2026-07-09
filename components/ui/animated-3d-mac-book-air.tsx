import * as React from "react";

import { cn } from "@/lib/utils";

type MacbookProps = React.HTMLAttributes<HTMLDivElement>;

const keyClasses =
  "macbook-key custom-animate-keys float-left m-[1px] size-[6px] rounded-[2px] bg-[#444] shadow-[0_-2px_0_#222]";

const Macbook = React.forwardRef<HTMLDivElement, MacbookProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "macbook-container absolute left-1/2 top-1/2 ml-[-78px] mt-[-85px] h-[96px] w-[150px]",
          className,
        )}
        {...props}
      >
        <div className="macbook-inner custom-animate-rotate absolute left-0 top-0 z-20 h-[96px] w-[150px]">
          <div className="macbook-screen custom-animate-lid-screen absolute bottom-0 left-0 h-[96px] w-[150px] rounded-[7px] bg-[#ddd] bg-[linear-gradient(45deg,rgba(0,0,0,0.34)_0%,rgba(0,0,0,0)_100%)] bg-[length:300px_300px] bg-left-bottom shadow-[inset_0_3px_7px_rgba(255,255,255,0.5)]">
            <div className="macbook-screen-face-one absolute bottom-0 left-0 h-[96px] w-[150px] rounded-[7px] bg-[#d3d3d3] bg-[linear-gradient(45deg,rgba(0,0,0,0.24)_0%,rgba(0,0,0,0)_100%)]">
              <div className="absolute left-1/2 top-[4px] ml-[-1.5px] size-[3px] rounded-full bg-black" />
              <div className="relative m-[10px] h-[74px] w-[130px] rounded-[1px] bg-black bg-[length:100%_100%] shadow-[inset_0_0_2px_rgba(0,0,0,1)]">
                <div className="custom-animate-screen-shade absolute left-0 top-0 h-[74px] w-[130px] bg-[linear-gradient(-135deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.1)_47%,rgba(255,255,255,0)_48%)] bg-[length:300px_200px] bg-[position:0px_0px]" />
              </div>
              <span className="absolute left-[57px] top-[85px] text-[6px] text-[#666]">
                MacBook Air
              </span>
            </div>
          </div>

          <div className="macbook-body custom-animate-lid-macbody absolute bottom-0 left-0 h-[96px] w-[150px] rounded-[7px] bg-[#cbcbcb] bg-[linear-gradient(45deg,rgba(0,0,0,0.24)_0%,rgba(0,0,0,0)_100%)]">
            <div className="macbook-body-face-one custom-animate-lid-keyboard-area absolute bottom-0 left-0 h-[96px] w-[150px] rounded-[7px] bg-[#dfdfdf] bg-[linear-gradient(30deg,rgba(0,0,0,0.24)_0%,rgba(0,0,0,0)_100%)]">
              <div className="absolute left-1/2 top-1/2 ml-[-18px] mt-[-44px] h-[31px] w-[40px] rounded-[4px] bg-[#cdcdcd] bg-[linear-gradient(30deg,rgba(0,0,0,0.24)_0%,rgba(0,0,0,0)_100%)] shadow-[inset_0_0_3px_#888]" />
              <div className="macbook-keyboard absolute left-[7px] top-[41px] h-[45px] w-[130px] overflow-hidden rounded-[4px] bg-[#cdcdcd] bg-[linear-gradient(30deg,rgba(0,0,0,0.24)_0%,rgba(0,0,0,0)_100%)] pl-[2px] shadow-[inset_0_0_3px_#777]">
                {Array.from({ length: 58 }).map((_, index) => (
                  <div key={`key-norm-${index}`} className={keyClasses} />
                ))}
                <div className={cn(keyClasses, "w-[45px]")} />
                {Array.from({ length: 16 }).map((_, index) => (
                  <div
                    key={`key-f-${index}`}
                    className={cn(keyClasses, "h-[3px]")}
                  />
                ))}
              </div>
            </div>
            <div className="absolute left-[20px] top-[20px] size-[5px] rounded-full bg-[#333]" />
            <div className="absolute right-[20px] top-[20px] size-[5px] rounded-full bg-[#333]" />
            <div className="absolute bottom-[20px] right-[20px] size-[5px] rounded-full bg-[#333]" />
            <div className="absolute bottom-[20px] left-[20px] size-[5px] rounded-full bg-[#333]" />
          </div>
        </div>
        <div className="macbook-shadow custom-animate-macbook-shadow absolute left-[40px] top-[160px] h-0 w-[60px] shadow-[0_0_60px_40px_rgba(0,0,0,0.3)]" />
      </div>
    );
  },
);

Macbook.displayName = "Macbook";

export { Macbook };
