import Bouquet from "@/components/bouquet";
import { getBouquetById } from "@/lib/fetch";
import Image from "next/image";
import Link from "next/link";

interface Params {
  params: Promise<{ id: string }>;
}

export default async function BouquetPage(props: Params) {
  const { id } = await props.params;
  const result = await getBouquetById(Number(id));

  if (!result) return <div>404 - Bouquet not found</div>;

  return (
    <div className="text-center p-6 bg-[#F9F9EE] min-h-screen">
      <Link href="/">
        <Image
          src="/digiflority.png"
          alt="digiflority"
          width={200}
          height={80}
          className="object-cover mx-auto my-10"
          priority
        />
      </Link>
      <h2 className="text-lg mb-14">Hi, I made this bouquet for you!</h2>
      <Bouquet bouquet={result.bouquet} />
      <p className="text-sm text-gray-500 mt-4">
        made with digiflority, a tool by keerthi
      </p>
      <Link href="/" className="block text-sm underline text-gray-500 mt-2">
        Make a bouquet now!
      </Link>
    </div>
  );
}
