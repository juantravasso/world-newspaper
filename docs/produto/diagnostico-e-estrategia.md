# Diagnóstico e estratégia — World Newspaper → produto comercial

Data da auditoria: 2026-11-25. Números tirados do banco e do código nesta data, não estimados.

---

## 0. Veredito em uma frase

O código é razoável e a base é reaproveitável, mas o produto hoje **não funciona** (a coleta parou há 2 meses) e **não tem a matéria-prima** para o diferencial que você quer vender (múltiplas perspectivas por fato). Antes de redesenhar marca ou construir área de criador, é preciso consertar coleta e cobertura de fontes; caso contrário, vamos embalar com cuidado um produto vazio.

---

## 1. Números reais

| Métrica | Valor | Leitura |
|---|---|---|
| Notícia mais recente coletada | 21/09/2026 | Site exibe conteúdo de **~65 dias atrás** |
| Último registro em `sync_runs` | 21/08/2026 | Monitoramento também parou |
| Fontes cadastradas | 152 (55 países, ~3 por país) | Cobertura rasa por país |
| Fontes que **nunca** produziram um artigo | **107 de 152** | 49 sem RSS + 58 com RSS quebrado/silencioso |
| Stories com 2+ fontes | **5 em ~10.300** | Agrupamento praticamente não acontece |
| Stories sem imagem (fora futebol) | 18% | Fallback Pexels cobre parte |
| Traduções PT salvas | 17 | Crons de tradução pausados |
| Commits do branch atual fora do `master` | 28 | Produção (deploy de `master`) roda código de julho |
| Tamanho do banco | 39 MB | Sem preocupação de custo |
| Testes automatizados | 1 arquivo (clustering) | Cobertura quase nula |

### Causa provável da coleta parada (hipótese, não verificada)

O cron de sincronização roda via GitHub Actions a partir do `master`. O último commit no `master` é de 22/07/2026. O GitHub **desativa workflows agendados em repositórios públicos após 60 dias sem atividade** — 22/07 + 60 dias = 20/09, e a última notícia é de 21/09. Não consegui confirmar porque o `gh` CLI não está instalado. Verificação: GitHub → Actions → "Sync production news" → se aparecer "This scheduled workflow is disabled", é isso.

---

## 2. O que o projeto já possui e funciona

- **Pipeline de coleta RSS** (`src/server/news/build-region-countries.ts`, `rss/rss-parser.ts`): parsing, normalização, deduplicação, classificação por palavras-chave (`classify-news.ts`), ids estáveis por hash. Bem feito.
- **Agrupamento por país** (`stories/cluster-articles.ts`): Jaccard sobre títulos, com teste. Funciona, mas sem fontes suficientes por país ele quase nunca agrupa.
- **Persistência com upsert + retenção** (`story.persistence.ts`, `story.sync.ts`): idempotente, retenção de 14 dias, monitoramento de execuções (`sync_runs`).
- **Tradução PT** (`ai/translate.ts`, `story.translate-portuguese.ts`): Haiku, nunca lança, backlog drenado por filtro no banco. Pausada.
- **Fallback de imagem** (Pexels + termo gerado por IA).
- **Painel admin** com login por senha, comparação em tempo constante, rate limit de login, cookie httpOnly, CRUD de fontes, disparo de sync, dashboard de execuções.
- **Páginas**: home, `/noticias`, `/politica`, `/economia`, `/paises/[pais]`, `/paises/[pais]/[categoria]`, detalhe com modal (rota interceptada), busca, "Minha seleção" (localStorage).
- **TypeScript rígido**: zero `any` no código de aplicação.

## 3. O que está quebrado ou parcialmente funcional

| Item | Estado | Prioridade |
|---|---|---|
| Coleta de produção | Parada há ~65 dias | P0 |
| 107 fontes sem nenhum artigo | Silenciosamente mortas; o admin não alerta | P0 |
| `master` sem 28 commits | Produção não tem nada do trabalho recente | P0 |
| `POST /api/reader-library` | Lê a tabela inteira a cada chamada, sem cache, público e sem rate limit | P0 (segurança/custo) |
| Busca (`story.discovery.ts`) | Lê a tabela inteira e filtra em memória a cada termo novo | P1 |
| ~~Página de notícia lendo a tabela inteira~~ | **Corrigido nesta sessão** (commit `b21a7ca`) | — |
| Banco de dev e produção | Aparentemente o **mesmo** banco Neon (o `.env` local aponta para ele) | P0 |
| Crons de tradução e extração | Pausados por decisão sua | Decisão pendente |
| Categorias | Só política e economia (futebol oculto) | P1 |

## 4. O que deve ser removido (precisa da sua confirmação antes)

- `src/server/stories/story.mock.ts` e o tipo `MockNewsSource` em `news.types.ts`: código morto, nenhum import.
- `rss-audit-*.json` na raiz: saídas de auditoria antigas versionadas no repositório.
- README padrão do `create-next-app`: não descreve o projeto.

## 5. Segurança

| Achado | Risco | Correção proposta |
|---|---|---|
| Nenhum rate limit fora do login admin | Abuso de `/api/reader-library` e `/api/stories` → custo de banco/função | Rate limit por IP nos endpoints públicos |
| `/api/reader-library` amplifica consulta | 1 requisição anônima = leitura de ~6.800 linhas + artigos | Buscar só os ids pedidos (máx. 100) |
| Dev e prod no mesmo banco | Um teste local pode apagar dado de produção (já fizemos um `DROP TABLE` nele) | Branch Neon separado para dev |
| Sem usuários/autenticação de leitor | Não há o que proteger ainda; vira P0 quando houver assinatura | Ver §10 |
| Imagens dos veículos servidas por hotlink | Risco jurídico em produto pago | Ver §8 |

Pontos positivos: segredos fora do git, endpoints internos com `CRON_SECRET`, admin com comparação em tempo constante e rate limit.

## 6. UX/UI — leitura honesta

- **Visual genérico de SaaS**: Inter, azul-marinho + laranja, cards com raio de 24px e sombra dupla em tudo. É exatamente o que você pediu para evitar.
- **Promessa sem lastro**: a home diz "fontes verificadas e diferentes perspectivas", mas não existe critério de verificação nem perspectivas múltiplas (5 stories com 2+ fontes).
- **Idioma misturado**: manchetes em espanhol/inglês ao lado de PT, porque a tradução está pausada.
- **Sem resposta para "o que importa hoje"**: a home é um carrossel por região; não há hierarquia de relevância.
- **Sem modo escuro, sem sitemap/robots**, metadados só em parte das rotas.
- Mobile não foi avaliado visualmente nesta auditoria. Fica para a fase de design.

---

## 7. Onde eu discordo do pedido (modo debate)

### 7.1 "Uma notícia, múltiplas perspectivas" contradiz uma decisão sua de setembro

Em setembro você pediu para **excluir** "a lógica de comparar as fontes e de ver a mesma notícia" e trocar por "algo mais simples". Agora essa mesma função aparece como "uma das mais importantes do produto". Não é problema mudar de ideia, mas precisa ser explícito, porque a remoção apagou as tabelas e o job de embeddings.

O ponto mais importante: **o motivo real de a função não ter funcionado não era o código, era a cobertura**. Com ~1 fonte funcionando por país, não existe "como a imprensa chinesa cobre vs. a americana". Reconstruir a tela antes de ter de 4 a 6 fontes ativas nos países-chave repete o mesmo fracasso.

### 7.2 O B2B2C completo é a aposta mais cara e menos validada

White-label, comunidades por criador, curadoria, monetização do criador e divisão de receita exigem multi-tenancy, billing com repasse, moderação e suporte. Isso é trabalho de meses antes do primeiro real. E o influenciador só oferece algo à audiência se o produto já resolve o problema **dele**.

### 7.3 Assinatura individual (modelo C) compete com notícia grátis

O seguidor comum não paga por manchete traduzida. Ele paga por **economia de tempo com curadoria em que confia**, e essa confiança é do criador, não nossa.

### 7.4 Direitos autorais são um risco do modelo de negócio, não só jurídico

Hoje o produto guarda manchete, resumo do RSS (até 280 caracteres), imagem do veículo por hotlink e **traduz** manchete + resumo. Num agregador gratuito isso é prática comum; num produto pago o risco sobe. Na União Europeia, a Diretiva 2019/790 (art. 15) dá direitos a editores sobre usos online além de "trechos muito curtos". Não sou advogado e não verifiquei a jurisprudência brasileira: **um parecer jurídico deve vir antes de cobrar**. A direção técnica segura é manchete + link + metadados + análise **nossa** (gerada por IA a partir de vários sinais, com fonte citada), nunca o texto do veículo traduzido na íntegra.

---

## 8. Estratégia recomendada

### 8.1 Modelo de negócio: começar pelo D (ferramenta do criador), com um "A-lite" depois

| Modelo | Implementação | Receita inicial | Aquisição | Retenção | Recomendação |
|---|---|---|---|---|---|
| A — white-label | Muito alta | Alta por cliente | Lenta | Alta | Não agora |
| B — comunidades | Muito alta | Média | Média | Alta | Não agora |
| C — assinatura individual | Média | Baixa | Cara (vs. grátis) | Baixa | Não como entrada |
| **D — plano para criadores** | **Média** | **Média** | **Direta (venda 1:1)** | **Alta se virar rotina de pauta** | **Começar aqui** |

Por quê: dá para vender para 5–10 criadores numa conversa, cobrar em semanas, e cada um vira estudo de caso. Quando o criador já usa diariamente, o passo seguinte natural é o **A-lite**: link de convite com a marca do criador para a audiência dele (acesso de leitura, sem área do criador), cobrado por assento ou incluído no plano do criador. Comunidade, white-label completo e repasse ficam para depois de validar.

### 8.2 Cliente ideal (ICP) do primeiro ano

Criador brasileiro de **economia/geopolítica** com 20k–300k seguidores, que **publica pelo menos 3 vezes por semana** (YouTube, Instagram ou newsletter) e já tem algum produto pago (comunidade, curso, newsletter premium). Dor principal: achar pauta diferenciada rápido e com fonte citável.

### 8.3 Proposta de valor

> **"O que o mundo está discutindo hoje — e o Brasil ainda não."**
> Pautas internacionais detectadas nas fontes locais de cada país, com contexto, fontes citáveis e o quanto o assunto já chegou à imprensa brasileira.

Isso responde às duas perguntas que você colocou:
- **Por que o criador paga?** Porque encontra pauta **antes** da saturação, com fontes citáveis, em minutos em vez de horas.
- **Por que o seguidor paga?** Ele paga o **criador**; nosso produto é um benefício que aumenta o valor percebido da assinatura dele.

### 8.4 O diferencial difícil de copiar

1. **Detector de lacuna Brasil × mundo**: cruzamento entre idiomas (embeddings) do que aparece em fontes estrangeiras e não aparece nas brasileiras. Exige ~20 fontes brasileiras + ~4–6 por país prioritário. A vantagem cresce com o histórico.
2. **Catálogo curado de fontes locais** com metadados verificáveis (país, idioma, tipo: estatal, privada, agência, independente; quem é o dono quando houver fonte pública). É trabalho manual e acumulativo, portanto difícil de copiar.
3. **Briefing de pauta com fontes rastreáveis**: cada afirmação aponta para um link original.

---

## 9. MVP comercial (o menor conjunto que vende)

**Precisa funcionar de verdade:**
1. Coleta estável, com alerta quando uma fonte para (P0).
2. Cobertura: **12 países prioritários × 4–6 fontes funcionando** + 20 fontes brasileiras.
3. Agrupamento entre idiomas por fato (embeddings, de volta) → a página do fato mostra quem cobriu, de que país e em que língua.
4. **Radar de pautas**: lista diária de fatos ranqueados por volume internacional × baixa presença no Brasil.
5. **Briefing de pauta** (sob demanda, com custo controlado): resumo, por que importa, países envolvidos, cronologia curta, links originais, 3 ângulos sugeridos.
6. Tradução das **manchetes** para PT (resumo gerado por nós, não o texto do veículo).
7. Conta de usuário + login (e-mail com link mágico) + assinatura (Stripe ou Mercado Pago) + gating por recurso (padrão do brain `plan-feature-gating`).
8. Salvar e acompanhar um fato (já existe em localStorage; migrar para conta).
9. Identidade visual nova aplicada em home, fato, país, radar e conta.

**Pode ser manual/simulado no protótipo comercial (marcado como tal):**
- Onboarding do criador feito por você em call.
- Faturamento por link de pagamento antes da integração completa.
- Alertas por e-mail diário (em vez de push).

**Fica fora do MVP:**
- Mapa interativo (alto custo e não é o que fecha venda; volta na P2 se o uso pedir).
- Comunidade e comentários (moderação custa caro).
- White-label e repasse para criador.
- Assistente de pesquisa conversacional (risco de alucinação; o briefing com fontes cobre 80% do valor).
- App nativo (web responsivo resolve).
- Inglês.

---

## 10. Roadmap

### P0 — Crítico (antes de qualquer outra coisa)
1. Reativar coleta: confirmar a causa no GitHub Actions; mover o cron para um lugar que não se desativa (Vercel Cron, conforme o plano da conta) ou manter atividade no `master`.
2. Levar os 28 commits para o `master` (PR + revisão) para produção refletir o código atual.
3. Separar banco de dev e de produção (branch Neon).
4. `/api/reader-library`: buscar só os ids pedidos + rate limit nos endpoints públicos.
5. Saúde de fontes: painel/alerta "fonte sem artigo há X horas"; revalidar as 58 com RSS que nunca produziram.

### P1 — MVP
6. Expansão de fontes: 12 países prioritários + 20 brasileiras (catálogo com metadados verificáveis).
7. Embeddings + agrupamento entre idiomas por fato (reintroduz o que foi removido, agora com cobertura).
8. Radar de pautas + indicador de lacuna no Brasil.
9. Busca no banco (Postgres full-text/trigram), não em memória.
10. Nova identidade visual + design system (tokens, tipografia, componentes).
11. Contas, login por link mágico, assinatura, gating por recurso.
12. Briefing de pauta sob demanda com limite por plano.
13. Página de fato redesenhada (quem cobriu, de onde, linha do tempo).
14. Testes: unitários do pipeline + e2e dos fluxos de pagamento e gating.
15. Termos de uso, política de privacidade (LGPD), parecer jurídico sobre conteúdo de terceiros.

### P2 — Depois do MVP
16. Alertas configuráveis (país, tema, fato acompanhado) por e-mail/push.
17. Link de convite com marca do criador para a audiência (A-lite) + métricas de uso por criador.
18. Monitoramento de temas/palavras-chave/organizações.
19. Mapa como navegação (só se os dados de uso mostrarem demanda).
20. Blocos econômicos e organizações como coleções (dados-driven, não hardcoded).

### P3 — Expansão
21. Comunidades por criador, comentários moderados, enquetes.
22. White-label completo e repasse automático.
23. Interface em inglês.
24. Indicadores econômicos de fontes oficiais por país.

---

## 11. Direção de design (proposta, aguardando sua aprovação)

### Nome

"World Newspaper" é genérico, está em inglês e promete um **jornal**, que o produto não é. Proposta principal: **Paralelo**, com dois sentidos: a linha de latitude (cartografia, visão global) e as perspectivas **em paralelo** de vários países sobre o mesmo fato. Alternativas: **Meridiano**, **Latitude**. ⚠️ Não verifiquei disponibilidade de domínio nem registro no INPI; é preciso checar antes de adotar.

### Conceito

Um **atlas editorial**: rigor de publicação de análise + linguagem de cartografia. Credibilidade vem de tipografia, densidade de informação bem organizada e metadados visíveis (país, idioma, veículo, horário local), não de efeitos.

### Paleta (papel e tinta + um sinal)

| Token | Claro | Escuro | Uso |
|---|---|---|---|
| Papel (fundo) | `#F3EFE6` | `#121210` | Fundo geral |
| Tinta (texto) | `#191814` | `#ECE7DC` | Texto principal |
| Grafite | `#5E5A52` | `#A39E93` | Metadados |
| Linha | `#D9D2C3` | `#2C2A25` | Fios e divisores |
| Oceano | `#134E4A` | `#5FB3AC` | Links, ação primária |
| Ocre | `#B5651D` | `#E0954F` | Sinal: "em desenvolvimento", lacuna no Brasil |

Sem gradientes, sem roxo/azul de IA. Contraste a validar (WCAG AA) na implementação.

### Tipografia

- **Manchetes**: serifa editorial (ex.: *Newsreader*), porque transmite credibilidade de publicação.
- **Interface**: sans humanista sóbria (ex.: *Instrument Sans*), não Inter.
- **Metadados e dados**: mono (ex.: *IBM Plex Mono*) para a "linha de crédito" cartográfica: `BUENOS AIRES · LA NACIÓN · ES→PT · 14:32 local`.

### Linguagem visual

- Fios finos (1px) e colunas em vez de cards com sombra; raio de 2–4px.
- Hierarquia por tamanho de tipo e espaço em branco, não por cor.
- Bandeira só como marcador pequeno; o país é identificado pelo **código + nome**.
- Mapas: contorno simples, sem relevo; países com cobertura em Oceano e lacuna em Ocre.
- Microinterações curtas (≤150ms), sem parallax nem "reveal" decorativo.

---

## 12. Custos operacionais previstos (MVP)

| Item | Estimativa | Observação |
|---|---|---|
| Tradução de manchetes (Haiku) | ~US$ 10–25/mês | Só manchete reduz o custo atual |
| Embeddings (Voyage lite) | ~US$ 1–3/mês | Volume atual × 3 |
| Briefing sob demanda | ~US$ 0,01–0,03 por briefing | Limitado por plano |
| Neon + Vercel | Depende do plano (Vercel Cron frequente exige Pro) | Verificar plano atual |
| Gateway de pagamento | % por transação | Stripe/Mercado Pago |

---

## 13. Decisões que dependem de você

1. Modelo de entrada: **D (ferramenta do criador)** como recomendado, ou outro.
2. Reintroduzir a comparação entre países (desfaz a decisão de setembro), **condicionada** à expansão de fontes.
3. Nome e direção visual (§11).
4. Correção de segurança em `/api/reader-library` + rate limit público (§5).
5. Remoção do código morto listado em §4.
