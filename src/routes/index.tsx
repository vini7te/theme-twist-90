import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, Loader2, Menu, PackageOpen } from "lucide-react";
import storePreview from "@/assets/store-preview.webp";
import { CartDrawer } from "@/components/store/cart-drawer";
import { ProductCard } from "@/components/store/product-card";
import { Button } from "@/components/ui/button";
import { useCartSync } from "@/hooks/use-cart-sync";
import { fetchProducts } from "@/lib/shopify";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Belmyra | Tecnologia para explorar" },
    { name: "description", content: "Conheça os produtos e novidades da Belmyra." },
    { property: "og:title", content: "Belmyra | Tecnologia para explorar" },
    { property: "og:description", content: "Conheça os produtos e novidades da Belmyra." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Index,
});

function Index() {
  useCartSync();
  const { data: products = [], isLoading, isError } = useQuery({ queryKey: ["shopify-products"], queryFn: fetchProducts });
  return (
    <div className="min-h-screen bg-background">
      <header className="absolute inset-x-0 top-0 z-20 border-b border-primary-foreground/20 text-primary-foreground">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 md:px-10">
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir menu"><Menu /></Button>
          <a href="#inicio" className="text-xl font-bold uppercase tracking-[0.14em]">Belmyra</a>
          <nav className="hidden items-center gap-8 text-sm md:flex"><a href="#inicio">Início</a><a href="#produtos">Produtos</a><a href="#sobre">Sobre</a></nav>
          <CartDrawer />
        </div>
      </header>

      <main>
        <section id="inicio" className="relative flex min-h-[88vh] items-end overflow-hidden bg-primary text-primary-foreground">
          <img src={storePreview} alt="Barco tecnológico para pesca em navegação" className="absolute inset-0 h-full w-full object-cover object-center" />
          <div className="absolute inset-0 bg-foreground/55" />
          <div className="relative mx-auto w-full max-w-7xl px-5 pb-16 pt-32 md:px-10 md:pb-24">
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.18em]">Tecnologia que vai mais longe</p>
            <h1 className="max-w-3xl text-5xl font-semibold leading-[1.04] md:text-7xl">Explore sem limites.</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-primary-foreground/80">Equipamentos inteligentes, confiáveis e prontos para transformar cada aventura.</p>
            <Button asChild size="lg" className="mt-8 bg-background text-foreground hover:bg-background/90"><a href="#produtos">Ver produtos <ArrowDown /></a></Button>
          </div>
        </section>

        <section id="produtos" className="mx-auto max-w-7xl px-5 py-20 md:px-10 md:py-28">
          <div className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Nossa seleção</p><h2 className="mt-3 text-4xl font-semibold md:text-5xl">Produtos em destaque</h2></div><p className="max-w-md text-muted-foreground">Itens cadastrados na Shopify aparecem automaticamente aqui.</p></div>
          {isLoading ? <div className="grid min-h-64 place-items-center"><Loader2 className="animate-spin" /></div> : products.length ? <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">{products.map((product) => <ProductCard key={product.node.id} product={product} />)}</div> : <div className="grid min-h-72 place-items-center rounded-md border border-dashed bg-secondary/40 px-6 text-center"><div><PackageOpen className="mx-auto mb-4 size-10 text-muted-foreground" /><h3 className="text-xl font-semibold">Nenhum produto encontrado</h3><p className="mt-2 max-w-md text-muted-foreground">{isError ? "Não foi possível carregar os produtos agora." : "Sua loja Shopify ainda não possui produtos cadastrados."}</p></div></div>}
        </section>

        <section id="sobre" className="bg-secondary py-20 md:py-24"><div className="mx-auto grid max-w-7xl gap-8 px-5 md:grid-cols-[1fr_1.2fr] md:px-10"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Belmyra</p><div><h2 className="text-3xl font-semibold md:text-5xl">Desempenho e confiança em cada detalhe.</h2><p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">Uma loja pensada para apresentar tecnologia de forma clara, moderna e preparada para vender.</p></div></div></section>
      </main>
      <footer className="border-t px-5 py-8 md:px-10"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 text-sm text-muted-foreground sm:flex-row"><span>© 2026 Belmyra</span><span>Loja conectada à Shopify</span></div></footer>
    </div>
  );
}
