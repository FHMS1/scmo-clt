# AGENTS.md — Simulador de Custo de Mão de Obra CLT

Guia para agentes de código (Claude Code, Codex, Cursor etc.) e para quem chega ao projeto. Descreve **estrutura, fluxo e convenções**. A intenção do produto está em [CLAUDE.md](CLAUDE.md) e as regras em [docs/specs/](docs/specs/README.md).

## Stack
React 19 · TypeScript (strict) · Vite · Vitest · html2pdf.js (lazy). Sem backend, sem router, sem state manager.

## Comandos
```bash
npm install
npm run dev        # servidor de desenvolvimento
npm test           # vitest run (domínio)
npm run typecheck  # tsc --noEmit
npm run build      # typecheck + build em dist/
npm run preview    # serve dist/
```
Antes de concluir qualquer mudança: `npm run typecheck && npm test && npm run build`.

## Estrutura
```
.
├── AGENTS.md                 # este arquivo (estrutura + convenções)
├── CLAUDE.md                 # ideia do projeto + regras de trabalho (importa este)
├── README.md                 # visão geral para humanos
├── index.html                # entrada Vite; script inline de tema antes do paint
├── vite.config.ts            # plugin React + config do Vitest
├── tsconfig.json             # strict, noUnused*
├── docs/specs/               # especificações (fonte de verdade das regras)
│   ├── README.md             # índice e como usar
│   ├── 00-visao-produto.md
│   ├── 01-calculo-dominio.md # fórmulas, tabelas, casos de aceite, A VALIDAR
│   ├── 02-regimes-tributarios.md
│   ├── 03-interface.md
│   ├── 04-exportacao.md
│   └── 05-roadmap.md
├── legacy/                   # v4.0 HTML/CSS/JS puro — REFERÊNCIA, não editar
│   ├── index.html
│   ├── css/styles.css
│   └── js/script.js
└── src/
    ├── main.tsx              # bootstrap React + imports de CSS
    ├── App.tsx               # estado do formulário, orquestra ações
    ├── domain/               # ⭐ regra de negócio PURA (sem React/DOM)
    │   ├── types.ts          # Regime, Tabelas, EntradaSimulacao, ResultadoSimulacao…
    │   ├── tabelas2026.ts    # ÚNICO lugar com alíquotas/faixas anuais
    │   ├── inss.ts           # calcularInss (progressivo + teto)
    │   ├── irrf.ts           # calcularIrrf (dedução, tabela, redutor Lei 15.270/2025)
    │   ├── simulador.ts      # simular(entrada, tabelas) → resultado
    │   ├── cnae.ts           # lista curada CNAE → grau de risco
    │   ├── formulario.ts     # FormState (strings) → EntradaSimulacao
    │   ├── glossario.ts      # termos + base legal
    │   ├── format.ts         # brl(), regimeLabel()
    │   └── simulador.test.ts # casos de aceite da spec 01
    ├── components/           # apresentação
    │   ├── Chrome.tsx        # Header, Hero, Banner, PdfHeader, Footer
    │   ├── InputsColumn.tsx  # Blocos 1–3 (formulário)
    │   ├── ResultsColumn.tsx # KPIs + cards A/B/C (forwardRef p/ PDF)
    │   ├── Glossario.tsx
    │   └── ui.tsx            # Card, Linha, Valor
    ├── hooks/
    │   ├── useTheme.ts       # data-theme + localStorage
    │   └── useToast.ts
    ├── services/
    │   └── exportar.ts       # imprimir(), salvarPdf() (import dinâmico)
    └── styles/
        ├── app.css           # tokens + componentes (port do legado)
        └── react.css         # ajustes da versão React (pdf-header, tabela IRRF…)
```

## Fluxo de dados
```
FormState (strings, App.tsx)
   └─ formParaEntrada() ──► EntradaSimulacao
        └─ simular(entrada, TABELAS) ──► ResultadoSimulacao   (useMemo)
             └─ InputsColumn (encargos) · ResultsColumn (cards/KPIs) · PdfHeader (regime)
```
Cálculo **nunca** acontece em componente nem em `useEffect`.

## Convenções
- **Idioma:** textos de UI e identificadores de domínio em pt-BR (`remuneracaoBruta`, `custoMensal`); nomes técnicos de React/TS em inglês.
- **Domínio puro:** `src/domain` não importa React, `window`, `document` nem CSS. Recebe `Tabelas` por parâmetro (default `TABELAS`) para ser testável.
- **Tabelas:** nenhuma alíquota/faixa literal fora de `tabelas2026.ts` (exceto textos explicativos/glossário).
- **Dinheiro:** `number` em R$, sem arredondamento intermediário; formatar só na borda com `brl()`.
- **CSS:** reutilizar tokens `--*` de `app.css`; não hardcodar cores. PDF/print sempre no tema claro.
- **Componentes:** pequenos, props explícitas, sem estado de negócio. Estado de formulário só em `App.tsx`.
- **Sem dependências novas** sem necessidade clara; `html2pdf.js` deve continuar fora do bundle inicial.

## Testes
- Vitest em `src/domain/*.test.ts`. Cada caso de aceite da spec 01 §6 tem teste correspondente.
- Mudou fórmula ⇒ atualizar spec **e** teste no mesmo commit.
- O legado (`legacy/js/script.js`) é referência histórica; onde a v5.1 diverge dele (IRRF, Anexo IV), vale a spec 01 §8.

## Atualização anual das tabelas
Editar `src/domain/tabelas2026.ts` (+ ajustar `anoTabelas`), rodar testes, revisar rótulos de ano. Passo a passo: spec 01 §7.

## Armadilhas conhecidas
- `legacy/` mantém `index.html` + `css/` + `js/` com caminhos relativos entre si; abrir `legacy/index.html` direto no navegador funciona.
- `html2pdf.js` não tipa `pagebreak`; por isso `opcoes` é variável intermediária em `exportar.ts`.
- IRRF: a redução usa o rendimento **bruto** e a base usa a maior dedução (INSS × simplificado); imposto e redução são arredondados a centavos para evitar resíduo de ponto flutuante.
