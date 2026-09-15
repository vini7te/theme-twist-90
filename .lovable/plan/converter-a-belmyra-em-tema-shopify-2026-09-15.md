# Converter a Belmyra em tema Shopify

## Resultado
Criar um tema Shopify Online Store 2.0 instalável em ZIP, reproduzindo a página premium atual da Belmyra e usando os dados reais do produto, carrinho e checkout da própria Shopify.

## O que será construído
- Estrutura completa de tema Shopify: layout, templates, sections, snippets, assets, configurações e traduções em pt-BR.
- Página de produto premium com a paleta clara Coastal Mist, cabeçalho fixo, galeria, preço, parcelamento, quantidade, estoque real e compra.
- Seções de benefícios, funcionalidades, vídeo do YouTube, GPS, bateria, compartimentos, comparação, galeria, embalagem, especificações, avaliações vazias, FAQ, oferta final, segurança e rodapé.
- Carrinho lateral integrado ao carrinho nativo da Shopify e botão de compra fixo no celular.
- Editor visual da Shopify para alterar textos, vídeo, especificações, benefícios, FAQ, contatos, redes sociais e cores sem editar código.
- SEO do produto e FAQ, imagens responsivas, carregamento otimizado e acessibilidade básica.

## Adaptações necessárias
- Substituir React/TanStack pelo padrão Liquid, CSS e JavaScript nativo da Shopify.
- Usar automaticamente título, imagens, preço, variantes, estoque e checkout do produto cadastrado na Shopify.
- Manter avaliações sem conteúdo fictício; o espaço continuará vazio até existirem avaliações reais.
- Manter contatos e políticas configuráveis, sem inventar WhatsApp, e-mail ou condições comerciais.
- O ZIP antigo do WordPress será usado apenas como fonte de imagens quando necessário; seus scripts e código WooCommerce não serão incorporados.

## Entrega e instalação
- Validar a estrutura e os arquivos obrigatórios do tema.
- Gerar `BELMYRA_TEMA_SHOPIFY.zip`, pronto para envio em **Loja virtual → Temas → Adicionar tema → Fazer upload do arquivo ZIP**.
- A instalação/substituição no painel da Shopify continuará exigindo o envio do ZIP e a publicação pelo proprietário, pois a conexão atual não concede gerenciamento de temas.

## Detalhes técnicos
- Compatibilidade: Shopify Online Store 2.0.
- Produto: template `product.belmyra.json` com seção principal configurável.
- Carrinho: endpoints nativos `/cart/add.js`, `/cart.js` e redirecionamento para `/checkout`.
- Configuração: schema de seções e `settings_schema.json`, sem dados secretos no tema.
