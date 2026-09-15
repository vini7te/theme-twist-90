import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PremiumProductPage } from "@/components/store/premium-product-page";
import { fetchProducts } from "@/lib/shopify";

export const Route = createFileRoute("/product/$handle")({
  loader: async ({ params }) => {
    const products = await fetchProducts();
    const product = products.find((entry) => entry.node.handle === params.handle);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData, params }) => {
    const product = loaderData?.product;
    const title = "Barca GPS para Pesca com Controle Remoto | NOME NOVO";
    const description = "Barca GPS para transportar e liberar iscas com precisão, controle remoto, bateria de 20.000 mAh e dois compartimentos.";
    const image = product?.node.images.edges[0]?.node.url;
    const price = product?.node.priceRange.minVariantPrice;
    return {
      meta: [
        { title }, { name: "description", content: description },
        { property: "og:title", content: title }, { property: "og:description", content: description },
        { property: "og:type", content: "product" }, { property: "og:url", content: `/product/${params.handle}` },
        { name: "twitter:card", content: "summary_large_image" },
        ...(image ? [{ property: "og:image", content: image }, { name: "twitter:image", content: image }] : []),
      ],
      links: [{ rel: "canonical", href: `/product/${params.handle}` }],
      scripts: product && price ? [{ type: "application/ld+json", children: JSON.stringify({
        "@context": "https://schema.org", "@type": "Product", name: "Barca GPS para pesca com controle remoto",
        description, image: product.node.images.edges.map(({ node }) => node.url), sku: product.node.id,
        offers: { "@type": "Offer", price: price.amount, priceCurrency: price.currencyCode, availability: product.node.variants.edges.some(({ node }) => node.availableForSale) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock", url: `/product/${params.handle}` },
      }) }] : [],
    };
  },
  notFoundComponent: ProductNotFound,
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  return <PremiumProductPage product={product} />;
}

function ProductNotFound() {
  return <main className="grid min-h-screen place-items-center bg-background px-6 text-center"><div><h1 className="text-3xl font-bold">Produto não encontrado</h1><Button asChild className="mt-6"><Link to="/"><ArrowLeft /> Voltar à loja</Link></Button></div></main>;
}