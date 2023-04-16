import Image from "next/image";

export function Avatar(props: {
  src: string;
  className?: string;
  width_height?: number;
}) {
  return (
    <Image
      src={props.src}
      width={props.width_height || 56}
      height={props.width_height || 56}
      className={` rounded-full ${props.className ? props.className : ""}`}
      alt="Profile Image"
    />
  );
}
