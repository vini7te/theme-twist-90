import { Link } from "@tanstack/react-router";
import { Loader2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cart-store";

export function ProductCard({ product }: { product: ShopifyProduct }) {
  const addItem = useCartStore((state) => state.addItem);
  const isLoading = useCartStore((state) => state.isLoading);
  const variant = product.node.variants.edges.find(({ node }) => node.availableForSale)?.node;
  const image = product.node.images.edges[0]?.node;
  return (
    <article className="group">
      <Link to="/product/$handle" params={{ handle: product.node.handle }} className="block overflow-hidden rounded-md bg-secondary">
        <div className="aspect-[4/5] overflow-hidden">
          {image ? <img src={image.url} alt={image.altText ?? product.node.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" /> : <div className="grid h-full place-items-center text-muted-foreground">Sem imagem</div>}
        </div>
      </Link>
      <div className="pt-4">
        <Link to="/product/$handle" params={{ handle: product.node.handle }} className="font-semibold hover:text-primary">{product.node.title}</Link>
        <p className="mt-1 text-sm text-muted-foreground">{product.node.priceRange.minVariantPrice.currencyCode} {Number(product.node.priceRange.minVariantPrice.amount).toFixed(2)}</p>
        <Button className="mt-4 w-full" disabled={!variant || isLoading} onClick={() => variant && void addItem({ product, variantId: variant.id, variantTitle: variant.title, price: variant.price, quantity: 1, selectedOptions: variant.selectedOptions })}>
          {isLoading ? <Loader2 className="animate-spin" /> : <ShoppingBag />} {variant ? "Adicionar à sacola" : "Indisponível"}
        </Button>
      </div>
    </article>
  );
}