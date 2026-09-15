import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Loader2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchProducts } from "@/lib/shopify";
import { useCartStore } from "@/stores/cart-store";

export const Route = createFileRoute("/product/$handle")({
  head: ({ params }) => ({ meta: [
    { title: `${params.handle} | NOME NOVO` },
    { name: "description", content: "Detalhes do produto na NOME NOVO." },
    { property: "og:title", content: `${params.handle} | NOME NOVO` },
    { property: "og:description", content: "Detalhes do produto na NOME NOVO." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: ProductPage,
});

function ProductPage() {
  const { handle } = Route.useParams();
  const { data: products = [], isLoading } = useQuery({ queryKey: ["shopify-products"], queryFn: fetchProducts });
  const addItem = useCartStore((state) => state.addItem);
  const adding = useCartStore((state) => state.isLoading);
  const product = products.find((entry) => entry.node.handle === handle);
  const variant = product?.node.variants.edges.find(({ node }) => node.availableForSale)?.node;
  if (isLoading) return <main className="grid min-h-screen place-items-center"><Loader2 className="animate-spin" /></main>;
  if (!product) return <main className="grid min-h-screen place-items-center px-6 text-center"><div><h1 className="text-3xl font-semibold">Produto não encontrado</h1><Button asChild className="mt-6"><Link to="/">Voltar à loja</Link></Button></div></main>;
  const image = product.node.images.edges[0]?.node;
  return (
    <main className="min-h-screen bg-background px-5 py-8 md:px-10">
      <div className="mx-auto max-w-6xl">
        <Button asChild variant="ghost"><Link to="/"><ArrowLeft /> Voltar</Link></Button>
        <div className="mt-8 grid gap-10 md:grid-cols-2">
          <div className="aspect-square overflow-hidden rounded-md bg-secondary">{image && <img className="h-full w-full object-cover" src={image.url} alt={image.altText ?? product.node.title} />}</div>
          <div className="self-center"><h1 className="text-4xl font-semibold">{product.node.title}</h1><p className="mt-4 text-2xl">{product.node.priceRange.minVariantPrice.currencyCode} {Number(product.node.priceRange.minVariantPrice.amount).toFixed(2)}</p><p className="mt-6 leading-7 text-muted-foreground">{product.node.description}</p><Button size="lg" className="mt-8" disabled={!variant || adding} onClick={() => variant && void addItem({ product, variantId: variant.id, variantTitle: variant.title, price: variant.price, quantity: 1, selectedOptions: variant.selectedOptions })}>{adding ? <Loader2 className="animate-spin" /> : <ShoppingBag />} Adicionar à sacola</Button></div>
        </div>
      </div>
    </main>
  );
}