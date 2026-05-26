import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col justify-center items-center p-4 min-h-screen font-mono uppercase">
      <div className="p-16 mx-auto max-w-4xl text-center">
        <Image
          src="/color/flowers/lily.png"
          alt="lilyy"
          width={100}
          height={100}
          className="object-cover mx-auto mb-6"
          priority
        />
        <Image
          src="/digiflority.png"
          alt="digiflority"
          width={550}
          height={250}
          className="mx-auto object-cover rotate-3"
          priority
        />
        <p className="my-6 text-sm md:mb-6 md:-mt-6">
          beautiful flowers <br /> delivered digitally
        </p>
        <div className="flex flex-col justify-center items-center">
          <Link
            href="/bouquet?mode=color"
            className="text-sm px-8 py-4 bg-[#000000] text-[#F5F5DC] hover:bg-[#0A0000]/90 m-2"
          >
            BUILD A BOUQUET
          </Link>

          <Link
            href="/bouquet?mode=mono"
            className="text-sm px-8 py-4 border border-black text-[#000000] hover:bg-[#F5F5AC]/90 m-2"
          >
            BUILD IT IN BLACK AND WHITE
          </Link>
          <Link
            href="/garden"
            className="text-sm px-8 py-4 underline text-[#000000] m-2"
          >
            VIEW GARDEN
          </Link>
        </div>

        <p className="mt-6 text-sm ">made by keerthii</p>
      </div>
    </div>
  );
}
