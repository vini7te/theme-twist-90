import { ExternalLink, Loader2, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { trackCommerceEvent } from "@/lib/commerce-analytics";
import { useCartStore } from "@/stores/cart-store";

export function CartDrawer() {
  const [open, setOpen] = useState(false);
  const { items, checkoutUrl, isLoading, isSyncing, removeItem, syncCart, updateQuantity } = useCartStore();
  const count = items.reduce((total, item) => total + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + Number(item.price.amount) * item.quantity, 0);
  useEffect(() => { if (open) void syncCart(); }, [open, syncCart]);
  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener("open-cart", handleOpen);
    return () => window.removeEventListener("open-cart", handleOpen);
  }, []);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Abrir sacola">
          <ShoppingBag />
          {count > 0 && <Badge className="absolute -right-1 -top-1 h-5 min-w-5 justify-center p-0">{count}</Badge>}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Sua sacola</SheetTitle>
          <SheetDescription>{count ? `${count} item${count > 1 ? "s" : ""}` : "Sua sacola está vazia"}</SheetDescription>
        </SheetHeader>
        <div className="mt-6 flex min-h-0 flex-1 flex-col">
          {!items.length ? (
            <div className="grid flex-1 place-items-center text-center text-muted-foreground">
              <div><ShoppingBag className="mx-auto mb-4 size-10" /><p>Nenhum produto adicionado.</p></div>
            </div>
          ) : (
            <>
              <div className="flex-1 space-y-5 overflow-y-auto">
                {items.map((item) => (
                  <div className="flex gap-4" key={item.variantId}>
                    <img className="size-20 rounded-md bg-secondary object-cover" src={item.product.node.images.edges[0]?.node.url} alt={item.product.node.images.edges[0]?.node.altText ?? item.product.node.title} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{item.product.node.title}</p>
                      <p className="text-sm text-muted-foreground">{item.variantTitle}</p>
                      <p className="mt-1 font-semibold">{item.price.currencyCode} {Number(item.price.amount).toFixed(2)}</p>
                      <div className="mt-2 flex items-center gap-1">
                        <Button variant="outline" size="icon" className="size-7" onClick={() => void updateQuantity(item.variantId, item.quantity - 1)} aria-label="Diminuir"><Minus /></Button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <Button variant="outline" size="icon" className="size-7" onClick={() => void updateQuantity(item.variantId, item.quantity + 1)} aria-label="Aumentar"><Plus /></Button>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => void removeItem(item.variantId)} aria-label="Remover"><Trash2 /></Button>
                  </div>
                ))}
              </div>
              <div className="border-t pt-5">
                <div className="mb-4 flex justify-between text-lg font-semibold"><span>Total</span><span>{items[0]?.price.currencyCode} {total.toFixed(2)}</span></div>
                <Button className="w-full" size="lg" disabled={!checkoutUrl || isLoading || isSyncing} onClick={() => { if (checkoutUrl) { trackCommerceEvent("begin_checkout", { value: total, currency: items[0]?.price.currencyCode, quantity: count }); window.open(checkoutUrl, "_blank"); } setOpen(false); }}>
                  {isLoading || isSyncing ? <Loader2 className="animate-spin" /> : <><ExternalLink /> Finalizar compra</>}
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}