import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Anchor, ArrowDown, ArrowLeft, ArrowRight, BatteryCharging, Box, Check, ChevronRight,
  Compass, Crosshair, ExternalLink, Facebook, Gauge, Instagram, Lightbulb, Loader2,
  LockKeyhole, MapPin, Maximize2, Menu, MessageCircle, Minus, Navigation, PackageCheck,
  PlayCircle, Plus, Radio, RotateCcw, Satellite, ShieldCheck, ShoppingBag, Signal, Sparkles, Star,
  Waves, Zap,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { CartDrawer } from "@/components/store/cart-drawer";
import { trackCommerceEvent } from "@/lib/commerce-analytics";
import type { ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cart-store";

const navItems = [
  ["Início", "topo"], ["Produto", "produto"], ["Como funciona", "funcionalidades"],
  ["Especificações", "especificacoes"], ["FAQ", "faq"], ["Contato", "contato"],
] as const;

const features = [
  { icon: Satellite, title: "GPS de navegação", text: "Trabalhe com pontos de pesca definidos e retorne aos locais selecionados com mais consistência." },
  { icon: Radio, title: "Controle de longo alcance", text: "Opere a embarcação remotamente de maneira prática e mantenha o comando durante a navegação." },
  { icon: Box, title: "Dois compartimentos", text: "Transporte diferentes tipos de isca simultaneamente e libere cada compartimento no momento certo." },
  { icon: RotateCcw, title: "Retorno automático", text: "Recurso destinado a facilitar o retorno da embarcação em situações específicas." },
  { icon: Lightbulb, title: "Iluminação", text: "Luzes dianteiras e traseiras facilitam a visualização em operações com pouca luminosidade." },
  { icon: Waves, title: "Estabilidade", text: "Estrutura e propulsão projetadas para uma navegação mais estável nas condições recomendadas." },
];

const faqItems = [
  ["Qual é o alcance da embarcação?", "O alcance informado para este modelo é de até 800 metros. Condições do ambiente, interferências e carga podem alterar o desempenho."],
  ["Quanto tempo dura a bateria?", "A autonomia estimada é de 2 a 4 horas, variando conforme carga, velocidade, vento, água e utilização."],
  ["Qual é a capacidade de isca?", "A capacidade total informada é de até 3 kg, distribuída em dois compartimentos de até 1,5 kg cada."],
  ["Quantos pontos GPS podem ser salvos?", "O sistema informado para este modelo permite memorizar até 180 pontos."],
  ["Possui retorno automático?", "Sim. O recurso auxilia o retorno em situações previstas pelo sistema, como perda de sinal ou bateria fraca."],
  ["Pode ser utilizada à noite?", "O produto possui iluminação dianteira e traseira para auxiliar a visualização com pouca luz. Avalie sempre as condições de segurança."],
  ["Quanto tempo leva para carregar?", "O carregamento completo leva aproximadamente 12 horas, conforme carregador e condições da bateria."],
  ["Quais acessórios acompanham o produto?", "O conjunto cadastrado inclui embarcação, controle remoto, bateria, carregador, antenas, hélice reserva, cabos, acessórios, bolsa e manual."],
  ["É resistente à água?", "A embarcação foi desenvolvida para uso na água nas condições recomendadas. O controle e os acessórios devem ser mantidos secos. Não recomendamos uso em água salgada."],
  ["Como funciona a garantia?", "As condições de garantia serão informadas na política comercial antes da publicação definitiva da loja."],
  ["Como funciona o envio?", "Prazo, transportadora e valor são calculados conforme o endereço e exibidos durante a finalização da compra."],
] as const;

const specs = [
  ["Modelo", "Barca GPS 20.000 mAh"], ["Tipo", "Embarcação para transporte e liberação de iscas"],
  ["Alcance", "Até 800 m"], ["GPS", "Navegação e retorno assistido"], ["Pontos memorizáveis", "Até 180"],
  ["Autonomia", "Estimativa de 2–4 horas"], ["Bateria", "Íons de lítio, 20.000 mAh / 222 Wh"],
  ["Tensão", "11,1 V"], ["Capacidade de isca", "Até 3 kg"], ["Compartimentos", "2 independentes"],
  ["Motores", "2 motores escovados classe 550"], ["Estabilização", "Assistência giroscópica"],
  ["Display", "LCD colorido de 4,3 polegadas"], ["Iluminação", "LED dianteiro e traseiro"],
  ["Material", "ABS com elementos de carbono"], ["Dimensões", "54,8 × 27,5 × 27,7 cm"],
  ["Peso", "Consulte a ficha final antes da publicação"],
] as const;

const packageItems = ["Embarcação", "Controle remoto", "Bateria", "Carregador", "Antenas", "Hélice sobressalente", "Cabos", "Acessórios", "Bolsa de transporte", "Manual"];

const benefitItems: Array<[LucideIcon, string, string]> = [
  [Crosshair, "GPS de precisão", "Navegação e localização dos pontos."],
  [BatteryCharging, "Longa autonomia", "Alta capacidade para sessões prolongadas."],
  [Box, "Grande capacidade", "Compartimentos para transporte de iscas."],
  [Radio, "Controle remoto", "Operação simples e intuitiva à distância."],
];

const trustItems: Array<[LucideIcon, string, string]> = [
  [LockKeyhole, "Compra segura", "Pagamento protegido."],
  [PackageCheck, "Envio seguro", "Produto embalado para transporte."],
  [ShieldCheck, "Suporte", "Atendimento antes e depois da compra."],
];

function formatMoney(amount: string, currencyCode: string) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: currencyCode }).format(Number(amount));
}

function SectionHeading({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return <div className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">{eyebrow}</p><h2 className="mt-4 text-3xl font-bold uppercase leading-tight md:text-5xl">{title}</h2>{text && <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">{text}</p>}</div>;
}

function BrandMark() {
  return <a href="#topo" className="flex shrink-0 items-center gap-3" aria-label="Belmyra — início"><span className="grid size-9 place-items-center border border-primary/50 bg-primary/10 text-primary"><Navigation className="size-5" /></span><span className="text-sm font-extrabold uppercase tracking-[0.16em]">Belmyra</span></a>;
}

export function PremiumProductPage({ product }: { product: ShopifyProduct }) {
  const images = product.node.images.edges.map(({ node }) => node);
  const [selectedImage, setSelectedImage] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const addItem = useCartStore((state) => state.addItem);
  const variant = product.node.variants.edges.find(({ node }) => node.availableForSale)?.node;
  const price = variant?.price ?? product.node.priceRange.minVariantPrice;
  const installment = Number(price.amount) / 12;
  const currentImage = images[selectedImage] ?? images[0];
  const productTitle = "Barca GPS para pesca com controle remoto";

  const gallery = useMemo(() => images.length ? images : [], [images]);

  useEffect(() => {
    trackCommerceEvent("view_item", { itemId: product.node.id, itemName: product.node.title, value: Number(price.amount), currency: price.currencyCode });
  }, [price.amount, price.currencyCode, product.node.id, product.node.title]);

  const changeImage = (direction: number) => {
    if (!gallery.length) return;
    setSelectedImage((current) => (current + direction + gallery.length) % gallery.length);
  };

  const handleBuy = async () => {
    if (!variant || adding) return;
    setAdding(true);
    try {
      await addItem({ product, variantId: variant.id, variantTitle: variant.title, price: variant.price, quantity, selectedOptions: variant.selectedOptions });
      trackCommerceEvent("add_to_cart", { itemId: product.node.id, itemName: product.node.title, value: Number(variant.price.amount) * quantity, currency: variant.price.currencyCode, quantity });
      window.dispatchEvent(new CustomEvent("open-cart"));
    } finally {
      setAdding(false);
    }
  };

  return (
    <div id="topo" className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <header className="fixed inset-x-0 top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto grid h-16 max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 sm:flex sm:h-20 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center"><BrandMark /></div>
          <nav className="mx-auto hidden items-center gap-7 text-xs font-semibold uppercase text-muted-foreground lg:flex">
            {navItems.map(([label, id]) => <a key={id} href={`#${id}`} className="transition-colors hover:text-primary">{label}</a>)}
          </nav>
          <div className="flex shrink-0 items-center gap-1.5">
            <CartDrawer />
            <Button className="hidden sm:inline-flex" onClick={() => void handleBuy()} disabled={!variant || adding}><ShoppingBag /> Comprar</Button>
            <Sheet>
              <SheetTrigger asChild><Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menu"><Menu /></Button></SheetTrigger>
              <SheetContent className="border-border bg-background">
                <SheetHeader><SheetTitle>Menu</SheetTitle><SheetDescription>Navegue pela página do produto.</SheetDescription></SheetHeader>
                <nav className="mt-10 flex flex-col">
                  {navItems.map(([label, id]) => <SheetClose asChild key={id}><a href={`#${id}`} className="border-b border-border py-4 text-lg font-semibold">{label}</a></SheetClose>)}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main>
        <section id="produto" className="scroll-mt-20 border-b border-border pt-24 md:pt-32">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-14 sm:px-6 md:pb-24 lg:grid-cols-[1.08fr_.92fr] lg:gap-16 lg:px-8">
            <div className="min-w-0">
              <div className="group relative aspect-[4/3] overflow-hidden border border-border bg-card" onTouchStart={(event) => setTouchStart(event.touches[0]?.clientX ?? null)} onTouchEnd={(event) => { const end = event.changedTouches[0]?.clientX; if (touchStart !== null && end !== undefined && Math.abs(touchStart - end) > 45) changeImage(touchStart > end ? 1 : -1); setTouchStart(null); }}>
                {currentImage ? <img src={currentImage.url} alt={currentImage.altText ?? productTitle} className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-[1.025]" fetchPriority="high" /> : <div className="grid h-full place-items-center text-muted-foreground">Imagem não disponível</div>}
                {gallery.length > 1 && <><Button variant="secondary" size="icon" className="absolute left-3 top-1/2 -translate-y-1/2" onClick={() => changeImage(-1)} aria-label="Imagem anterior"><ArrowLeft /></Button><Button variant="secondary" size="icon" className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => changeImage(1)} aria-label="Próxima imagem"><ArrowRight /></Button></>}
                <Button variant="secondary" size="icon" className="absolute right-3 top-3" onClick={() => setLightbox(true)} aria-label="Ampliar imagem"><Maximize2 /></Button>
                <div className="absolute bottom-3 right-3 bg-background/85 px-2 py-1 text-xs font-semibold backdrop-blur">{Math.min(selectedImage + 1, Math.max(gallery.length, 1))} / {Math.max(gallery.length, 1)}</div>
              </div>
              <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
                {gallery.map((image, index) => <button key={image.url} type="button" onClick={() => setSelectedImage(index)} className={`size-20 shrink-0 overflow-hidden border bg-card transition ${selectedImage === index ? "border-primary ring-1 ring-primary" : "border-border opacity-65 hover:opacity-100"}`} aria-label={`Ver imagem ${index + 1}`}><img src={image.url} alt={image.altText ?? `${productTitle}, imagem ${index + 1}`} className="h-full w-full object-cover" loading={index > 3 ? "lazy" : "eager"} /></button>)}
              </div>
            </div>

            <div className="self-center">
              <div className="inline-flex items-center gap-2 border border-primary/40 bg-primary/10 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-primary"><Crosshair className="size-4" /> Tecnologia para pesca de precisão</div>
              <h1 className="mt-6 text-4xl font-extrabold uppercase leading-[1.04] md:text-5xl lg:text-6xl">{productTitle}</h1>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">Leve sua isca exatamente onde você deseja, com precisão, autonomia e controle.</p>
              <div className="mt-6 flex items-center gap-3 border-y border-border py-4"><div className="flex" aria-label="Avaliações ainda não disponíveis">{Array.from({ length: 5 }).map((_, index) => <Star key={index} className="size-4 text-muted-foreground" />)}</div><span className="text-sm text-muted-foreground">Sem avaliações publicadas</span></div>
              <div className="mt-7"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Preço atual</p><p className="mt-1 text-4xl font-extrabold text-primary">{formatMoney(price.amount, price.currencyCode)}</p><p className="mt-2 text-sm text-muted-foreground">ou 12× de {formatMoney(String(installment), price.currencyCode)} sem juros</p></div>
              <div className="mt-7 flex items-end gap-4"><div><label htmlFor="quantity" className="mb-2 block text-xs font-bold uppercase text-muted-foreground">Quantidade</label><div className="flex h-12 items-center border border-border bg-card"><Button variant="ghost" size="icon" onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="Diminuir quantidade"><Minus /></Button><span id="quantity" className="w-10 text-center font-semibold">{quantity}</span><Button variant="ghost" size="icon" onClick={() => setQuantity((value) => Math.min(10, value + 1))} aria-label="Aumentar quantidade"><Plus /></Button></div></div><p className={`mb-3 text-sm font-semibold ${variant ? "text-primary" : "text-destructive"}`}>{variant ? "Disponível para compra" : "Indisponível"}</p></div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2"><Button size="lg" className="h-14 text-sm font-extrabold uppercase" onClick={() => void handleBuy()} disabled={!variant || adding}>{adding ? <Loader2 className="animate-spin" /> : <ShoppingBag />} Comprar agora</Button><Button asChild size="lg" variant="outline" className="h-14 text-sm font-extrabold uppercase"><a href="#funcionalidades">Quero saber mais <ArrowDown /></a></Button></div>
              <div className="mt-7 grid grid-cols-2 gap-3 text-xs text-muted-foreground sm:grid-cols-4">{["Envio nacional", "Compra segura", "Produto testado", "Suporte especializado"].map((item) => <div key={item} className="flex items-start gap-2"><Check className="mt-0.5 size-4 shrink-0 text-primary" /><span>{item}</span></div>)}</div>
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-card"><div className="mx-auto grid max-w-7xl sm:grid-cols-2 lg:grid-cols-4">{benefitItems.map(([Icon, title, text], index) => <div key={title} className={`p-6 lg:p-8 ${index < 3 ? "border-b border-border sm:border-r lg:border-b-0" : ""}`}><Icon className="size-7 text-primary" /><h2 className="mt-4 text-sm font-bold uppercase">{title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p></div>)}</div></section>

        <section className="relative overflow-hidden py-20 md:py-32">
          <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[.85fr_1.15fr] lg:px-8">
            <div><SectionHeading eyebrow="Controle estratégico" title="Pare de depender da sorte no lançamento." text="Transporte a isca até locais onde o lançamento convencional seria difícil, aumente a precisão e repita seus pontos de pesca com mais consistência." /><div className="mt-8 flex flex-wrap gap-2">{["Alcance", "GPS", "Retorno", "Iluminação", "Estabilidade", "Carga", "Controle remoto"].map((item) => <span key={item} className="border border-border bg-card px-3 py-2 text-xs font-semibold uppercase text-muted-foreground">{item}</span>)}</div></div>
            <div className="relative aspect-[4/3] border border-border bg-card p-6">{images[1] && <img src={images[1].url} alt={images[1].altText ?? "Vista técnica da barca GPS para pesca"} className="h-full w-full object-contain" loading="lazy" />}<div className="absolute left-5 top-5 flex items-center gap-2 bg-background/90 px-3 py-2 text-xs font-bold"><Signal className="size-4 text-primary" /> ATÉ 800 M</div><div className="absolute bottom-5 right-5 flex items-center gap-2 bg-background/90 px-3 py-2 text-xs font-bold"><Box className="size-4 text-primary" /> ATÉ 3 KG</div></div>
          </div>
        </section>

        <section id="funcionalidades" className="scroll-mt-20 border-y border-border bg-card py-20 md:py-28"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><SectionHeading eyebrow="Recursos essenciais" title="Tecnologia a serviço da sua estratégia." /><div className="mt-12 grid gap-px overflow-hidden border border-border bg-border md:grid-cols-2 lg:grid-cols-3">{features.map(({ icon: Icon, title, text }) => <article key={title} className="group bg-background p-7 transition-colors hover:bg-secondary"><Icon className="size-8 text-primary transition-transform group-hover:-translate-y-1" /><h3 className="mt-8 text-lg font-bold uppercase">{title}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{text}</p></article>)}</div></div></section>

        <section className="border-b border-border py-20 md:py-28" aria-labelledby="video-produto-title">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 grid items-end gap-6 lg:grid-cols-[1fr_auto]">
              <div className="max-w-3xl">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-primary"><PlayCircle className="size-4" /> Veja em ação</p>
                <h2 id="video-produto-title" className="mt-4 text-3xl font-bold uppercase leading-tight md:text-5xl">Conheça cada detalhe da barca GPS.</h2>
              </div>
              <p className="max-w-sm text-sm leading-6 text-muted-foreground">Assista ao vídeo completo diretamente na página e veja o produto em funcionamento.</p>
            </div>
            <div className="overflow-hidden border border-border bg-card p-2 shadow-[0_24px_70px_-35px_oklch(0.54_0.17_244_/_0.45)] sm:p-4">
              <div className="relative aspect-video overflow-hidden bg-secondary">
                <iframe
                  className="absolute inset-0 size-full"
                  src="https://www.youtube-nocookie.com/embed/VIJnRvbbxNM?rel=0"
                  title="Vídeo da barca GPS para pesca com controle remoto"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 md:py-32"><div className="mx-auto grid max-w-7xl gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:px-8"><div><SectionHeading eyebrow="Navegação inteligente" title="Seu ponto de pesca. Salvo e repetível." text="Uma leitura visual e ilustrativa de como os pontos podem orientar uma operação mais consistente." /><div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">{["Distância", "Bateria", "Posição", "Direção", "Sinal", "Ponto ativo"].map((item, i) => <div key={item} className="border border-border bg-card p-4"><p className="text-xs uppercase text-muted-foreground">{item}</p><p className="mt-2 font-mono text-lg font-bold text-primary">{["486 m", "82%", "23° S", "NE", "Forte", "P03"][i]}</p></div>)}</div></div><div className="relative min-h-[420px] overflow-hidden border border-border bg-secondary p-8"><div className="absolute inset-0 opacity-30 [background-image:linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] [background-size:36px_36px]" /><div className="absolute inset-8 rounded-[45%] border border-primary/30 bg-primary/5" />{[15,32,50,68,84].map((left, i) => <div key={left} className="absolute" style={{ left: `${left}%`, top: `${[58,30,67,43,23][i]}%` }}><span className="relative grid size-9 place-items-center rounded-full border border-primary bg-background text-xs font-bold text-primary">{i + 1}</span><span className="mt-1 block whitespace-nowrap text-[10px] font-semibold">Ponto 0{i + 1}</span></div>)}<div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2 border border-primary bg-background px-4 py-3 text-sm font-bold"><Navigation className="size-5 text-primary" /> EMBARCAÇÃO</div></div></div></section>

        <section className="border-y border-border bg-card py-20 md:py-28"><div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:px-8"><div className="relative mx-auto grid aspect-square w-full max-w-md place-items-center border border-border bg-background"><div className="absolute inset-12 border border-primary/20" /><BatteryCharging className="size-40 text-primary" /><span className="absolute bottom-8 font-mono text-sm text-muted-foreground">LÍTIO • 11,1 V</span></div><div><SectionHeading eyebrow="Energia de alta capacidade" title="Mais tempo na água. Menos interrupções." /><div className="mt-9 grid grid-cols-2 gap-px bg-border">{[["Capacidade", "20.000 mAh"], ["Tensão", "11,1 V"], ["Energia", "222 Wh"], ["Autonomia", "2–4 horas"], ["Carregamento", "Aprox. 12 horas"]].map(([label, value]) => <div key={label} className="bg-background p-5"><p className="text-xs uppercase text-muted-foreground">{label}</p><p className="mt-2 text-lg font-bold">{value}</p></div>)}</div><p className="mt-5 text-xs leading-5 text-muted-foreground">A autonomia pode variar de acordo com carga, velocidade, vento, condições da água e utilização.</p></div></div></section>

        <section className="py-20 md:py-28"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><SectionHeading eyebrow="Carga inteligente" title="Dois compartimentos. Mais possibilidades." /><div className="mt-12 grid gap-5 md:grid-cols-3">{[["A", "Compartimento A", "Até 1,5 kg"], ["B", "Compartimento B", "Até 1,5 kg"], ["Σ", "Capacidade total", "Até 3 kg"]].map(([mark, label, value], i) => <article key={label} className={`bait-hatch border p-7 ${i === 2 ? "border-primary bg-primary/10" : "border-border bg-card"}`}><span className="grid size-12 place-items-center border border-primary/40 font-mono text-lg font-bold text-primary">{mark}</span><h3 className="mt-10 text-sm font-bold uppercase">{label}</h3><p className="mt-2 text-2xl font-extrabold">{value}</p><div className="mt-6 h-1 overflow-hidden bg-secondary"><div className="h-full w-4/5 bg-primary" /></div></article>)}</div></div></section>

        <section className="border-y border-border bg-card py-20 md:py-28"><div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8"><SectionHeading eyebrow="Comparativo" title="Mais controle em cada decisão." /><div className="mt-12 overflow-hidden border border-border"><div className="grid grid-cols-2 bg-secondary text-xs font-bold uppercase sm:text-sm"><div className="p-4 sm:p-6">Pesca convencional</div><div className="border-l border-primary bg-primary/10 p-4 text-primary sm:p-6">Barca GPS</div></div>{[["Lançamento limitado", "Transporte preciso da isca"], ["Menor precisão", "Pontos de pesca definidos"], ["Dificuldade em longas distâncias", "Operação à distância"], ["Influência do vento", "Maior repetibilidade"], ["Difícil repetir o mesmo ponto", "Operação com pouca luz"], ["Maior esforço", "Menor esforço operacional"]].map(([before, after]) => <div key={before} className="grid grid-cols-2 border-t border-border text-xs sm:text-sm"><div className="p-4 text-muted-foreground sm:p-6">{before}</div><div className="flex items-start gap-2 border-l border-border p-4 font-semibold sm:p-6"><Check className="size-4 shrink-0 text-primary" />{after}</div></div>)}</div></div></section>

        <section className="py-20 md:py-28"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><SectionHeading eyebrow="Galeria premium" title="Projetada para ser vista em cada detalhe." /><div className="mt-12 grid auto-rows-[220px] gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 9 }).map((_, index) => { const image = images[index % Math.max(images.length, 1)]; const labels = ["Vista superior", "Vista lateral", "Vista traseira", "Controle remoto", "Compartimentos", "Bateria", "Acessórios", "Produto sobre a água", "Operação noturna"]; return <button type="button" key={labels[index]} onClick={() => { if (image) { setSelectedImage(index % images.length); setLightbox(true); } }} className={`group relative overflow-hidden border border-border bg-card text-left ${index === 0 || index === 7 ? "sm:col-span-2" : ""}`} aria-label={`Ampliar ${labels[index]}`}>{image && <img src={image.url} alt={image.altText ?? labels[index]} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />}<span className="absolute inset-x-0 bottom-0 bg-background/85 p-4 text-xs font-bold uppercase backdrop-blur">{labels[index]}</span></button>; })}</div></div></section>

        <section className="border-y border-border bg-card py-20 md:py-28"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><SectionHeading eyebrow="Conteúdo da embalagem" title="Tudo preparado para sua próxima sessão." /><div className="mt-12 grid grid-cols-2 gap-px bg-border md:grid-cols-5">{packageItems.map((item, i) => <div key={item} className="bg-background p-5"><span className="font-mono text-xs text-primary">{String(i + 1).padStart(2, "0")}</span><PackageCheck className="mt-8 size-7 text-muted-foreground" /><p className="mt-4 text-sm font-semibold">{item}</p></div>)}</div><p className="mt-5 text-xs text-muted-foreground">Confirme a lista final de componentes no pedido antes da compra.</p></div></section>

        <section id="especificacoes" className="scroll-mt-20 py-20 md:py-28"><div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8"><SectionHeading eyebrow="Ficha técnica" title="Informação clara. Decisão segura." /><dl className="mt-12 grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2">{specs.map(([label, value]) => <div key={label} className="grid grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)] gap-3 bg-card p-4 sm:p-5"><dt className="text-xs font-semibold uppercase text-muted-foreground">{label}</dt><dd className="text-right text-sm font-semibold">{value}</dd></div>)}</dl></div></section>

        <section className="border-y border-border bg-card py-20 md:py-28"><div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8"><SectionHeading eyebrow="Avaliações reais" title="Quem já pesca com mais precisão, aprova." text="Este espaço será preenchido somente com avaliações verificadas de compradores reais." /><div className="mt-10 border border-dashed border-border bg-background p-10 text-center"><Star className="mx-auto size-9 text-muted-foreground" /><h3 className="mt-4 font-bold">Ainda não há avaliações publicadas</h3><p className="mt-2 text-sm text-muted-foreground">Após a primeira compra, clientes poderão compartilhar uma avaliação verdadeira.</p></div></div></section>

        <section id="faq" className="scroll-mt-20 py-20 md:py-28"><div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[.7fr_1.3fr] lg:px-8"><SectionHeading eyebrow="Dúvidas frequentes" title="Antes de colocar na água." /><Accordion type="single" collapsible className="border-t border-border">{faqItems.map(([question, answer], index) => <AccordionItem key={question} value={`faq-${index}`}><AccordionTrigger className="py-5 text-left text-base hover:no-underline">{question}</AccordionTrigger><AccordionContent className="pb-6 leading-7 text-muted-foreground">{answer}</AccordionContent></AccordionItem>)}</Accordion></div></section>

        <section className="relative overflow-hidden border-y border-border bg-card py-20 md:py-28"><div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_.9fr] lg:px-8"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Sua próxima estratégia começa aqui</p><h2 className="mt-4 text-4xl font-extrabold uppercase leading-tight md:text-6xl">Pronto para levar sua pesca para outro nível?</h2><p className="mt-5 max-w-xl text-lg text-muted-foreground">Tenha mais precisão, controle e praticidade em cada sessão.</p><div className="mt-8 flex flex-wrap items-center gap-5"><span className="text-4xl font-extrabold text-primary">{formatMoney(price.amount, price.currencyCode)}</span><Button size="lg" className="h-14 px-8 uppercase" onClick={() => void handleBuy()} disabled={!variant || adding}>{adding ? <Loader2 className="animate-spin" /> : <ShoppingBag />} Comprar agora</Button></div></div><div className="aspect-[4/3] overflow-hidden border border-border bg-background">{images[2] && <img src={images[2].url} alt={images[2].altText ?? productTitle} className="h-full w-full object-contain" loading="lazy" />}</div></div></section>

        <section className="py-16"><div className="mx-auto grid max-w-7xl gap-px bg-border px-4 sm:px-6 md:grid-cols-3 lg:px-8">{trustItems.map(([Icon, title, text]) => <div key={title} className="bg-background p-7"><Icon className="size-7 text-primary" /><h3 className="mt-5 font-bold uppercase">{title}</h3><p className="mt-2 text-sm text-muted-foreground">{text}</p></div>)}</div></section>
      </main>

      <footer id="contato" className="scroll-mt-20 border-t border-border bg-card pb-24 pt-16 md:pb-10"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="grid gap-12 md:grid-cols-4"><div className="md:col-span-1"><BrandMark /><p className="mt-5 text-sm leading-6 text-muted-foreground">Tecnologia e controle para uma pesca mais estratégica.</p></div><div><h3 className="text-xs font-bold uppercase text-primary">Navegação</h3><div className="mt-5 flex flex-col gap-3 text-sm text-muted-foreground">{navItems.slice(0, 5).map(([label, id]) => <a key={id} href={`#${id}`}>{label}</a>)}</div></div><div><h3 className="text-xs font-bold uppercase text-primary">Atendimento</h3><p className="mt-5 text-sm leading-6 text-muted-foreground">WhatsApp e e-mail serão publicados após a confirmação dos contatos oficiais.</p><div className="mt-5 flex gap-2"><Button variant="outline" size="icon" disabled aria-label="Instagram pendente"><Instagram /></Button><Button variant="outline" size="icon" disabled aria-label="Facebook pendente"><Facebook /></Button><Button variant="outline" size="icon" disabled aria-label="WhatsApp pendente"><MessageCircle /></Button></div></div><div><h3 className="text-xs font-bold uppercase text-primary">Políticas</h3><div className="mt-5 flex flex-col gap-3 text-sm text-muted-foreground"><span>Política de troca</span><span>Garantia</span><span>Prazo de envio</span><span>Termos de compra</span><span>Política de privacidade</span></div></div></div><div className="mt-14 flex flex-col justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row"><span>© 2026 Belmyra.</span><span>Pagamento processado com segurança pela Shopify.</span></div></div></footer>

      <div className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t border-border bg-background/95 px-4 py-3 backdrop-blur md:hidden"><div className="min-w-0"><p className="truncate text-xs text-muted-foreground">Barca GPS</p><p className="font-bold text-primary">{formatMoney(price.amount, price.currencyCode)}</p></div><Button className="shrink-0 uppercase" onClick={() => void handleBuy()} disabled={!variant || adding}>{adding ? <Loader2 className="animate-spin" /> : <ShoppingBag />} Comprar agora</Button></div>

      <Dialog open={lightbox} onOpenChange={setLightbox}><DialogContent className="h-[92vh] max-w-[94vw] border-border bg-background p-3"><DialogTitle className="sr-only">Galeria ampliada do produto</DialogTitle><DialogDescription className="sr-only">Use as setas ou deslize para navegar pelas imagens.</DialogDescription><div className="relative grid h-full place-items-center overflow-hidden bg-card" onTouchStart={(event) => setTouchStart(event.touches[0]?.clientX ?? null)} onTouchEnd={(event) => { const end = event.changedTouches[0]?.clientX; if (touchStart !== null && end !== undefined && Math.abs(touchStart - end) > 45) changeImage(touchStart > end ? 1 : -1); setTouchStart(null); }}>{currentImage && <img src={currentImage.url} alt={currentImage.altText ?? productTitle} className="max-h-full max-w-full object-contain" />}<Button variant="secondary" size="icon" className="absolute left-3 top-1/2 -translate-y-1/2" onClick={() => changeImage(-1)} aria-label="Imagem anterior"><ArrowLeft /></Button><Button variant="secondary" size="icon" className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => changeImage(1)} aria-label="Próxima imagem"><ArrowRight /></Button></div></DialogContent></Dialog>
    </div>
  );
}