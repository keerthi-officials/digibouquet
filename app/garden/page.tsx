import BouquetOnly from "@/components/bouquet-only";
import { getAllBouquets } from "@/lib/fetch";
import Image from "next/image";
import Link from "next/link";

export default async function AllBouquetsPage() {
  const rows = await getAllBouquets();

  return (
    <div className="text-center p-6">
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
      <h2 className="text-md uppercase mb-4">OUR GARDEN</h2>
      <p className="text-sm opacity-50 mb-10">Thanks for stopping by!</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-6">
        {rows.map(({ id, bouquet, createdAt }) => (
          <div key={id}>
            <BouquetOnly bouquet={bouquet} />
            <p className="text-sm text-gray-500 m-10">
              {createdAt.toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
