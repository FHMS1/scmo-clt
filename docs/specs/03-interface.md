# 03 — Interface

Stack: React 19 + TypeScript + Vite. CSS portado do legado em `src/styles/app.css` (tokens + componentes) e ajustes em `src/styles/react.css`.

## Layout
```
Header (título · tag do ano)
Hero (título · ações: Limpar · PDF · Imprimir · Tema)
[Banner de tabelas desatualizadas — condicional]
Main — 2 colunas (400px | 1fr); 1 coluna ≤ 940px
 ├ Entradas
 │   Bloco 1 Regime (+ encargos no Presumido)
 │   Bloco 2 Dados do empregado (toggles: periculosidade, gratificação, comissão, VT, VA)
 │   Bloco 3 Tabela IRRF (derivada de TABELAS)
 └ Resultados
     KPIs (bruta · líquido · custo mensal · custo/hora)
     Card A Folha a pagar
     Card B O que o trabalhador recebe (+ badge e explicação do IRRF)
     Card C Provisões (+ custo com provisões)
     Aviso de estimativa
Glossário (mestre-detalhe, 14 termos com base legal)
Footer
```

## Componentes (`src/components/`)
| Arquivo | Responsabilidade |
|---|---|
| `Chrome.tsx` | Header, Hero (ações), Banner, PdfHeader, Footer |
| `InputsColumn.tsx` | Blocos 1–3; **sem** regra de cálculo, só formulário |
| `ResultsColumn.tsx` | KPIs e cards A/B/C; recebe `ResultadoSimulacao` pronto |
| `Glossario.tsx` | Lista + detalhe a partir de `domain/glossario.ts` |
| `ui.tsx` | `Card`, `Linha`, `Valor` (pulsa quando o número muda) |

## Estado
- Único estado de formulário: `FormState` (strings) em `App.tsx`.
- `formParaEntrada()` normaliza → `simular()` roda em `useMemo`. Sem `useEffect` para cálculo.
- Tema: `useTheme` (atributo `data-theme` + `localStorage` `clt-theme`); resolvido antes do paint por script inline em `index.html`.
- Toast: `useToast`.

## Comportamentos
- Cálculo a cada tecla; campos numéricos aceitam vazio.
- “Limpar” volta a `FORM_INICIAL` (regime Simples, CNAE 8211-3/00, FAP 1,0000, periculosidade 30%).
- Toggle desligado mantém o valor digitado mas o ignora no cálculo.
- Animação de pulso respeita `prefers-reduced-motion`.

## Acessibilidade (mínimo)
- Botões de ícone com `aria-label`; toggles com `aria-label`; glossário com `role=listbox/option` + `aria-selected`.
- Contraste AA nos dois temas; foco visível.
- A11y a melhorar: `htmlFor` em todos os campos, navegação por setas no glossário, `aria-live` nos KPIs. (ver Roadmap)

## Critérios de aceite
- [ ] Layout sem rolagem horizontal em 360px.
- [ ] Tema persiste entre visitas e respeita preferência do sistema na 1ª visita.
- [ ] Nenhuma regra de cálculo dentro de componentes (revisão de código).
- [ ] Todos os textos de interface em pt-BR.
