import { BouquetProvider } from "@/context/bouquet-context";
import BouquetCreationFlow from "@/components/bouquet-creation-flow";

export default async function Home(props: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const mode = (await props.searchParams).mode || "mono";

  return (
    <BouquetProvider mode={mode}>
      <BouquetCreationFlow />
    </BouquetProvider>
  );
}
