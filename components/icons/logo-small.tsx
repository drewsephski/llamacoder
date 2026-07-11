import Image from "next/image";

export default function LogoSmall() {
  return (
    <Image
      src="/squidagent-logo.svg"
      alt="Squid Agent"
      width={32}
      height={32}
      className="h-8 w-auto"
    />
  );
}
