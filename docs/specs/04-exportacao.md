# 04 — Exportação (PDF e impressão)

Implementação: `src/services/exportar.ts`, `PdfHeader` em `Chrome.tsx`, regras `@media print` e `.pdf-mode` em `src/styles/app.css` / `react.css`.

## Caminhos
| Ação | Mecanismo | Resultado |
|---|---|---|
| Salvar PDF | `html2pdf.js` (import dinâmico) sobre **clones** do `PdfHeader` + coluna de resultados dentro de `.pdf-mode` | Download direto, A4 retrato, margens 6mm |
| Imprimir | `window.print()` + `@media print` | Diálogo nativo do navegador |

## Conteúdo
- **Entra:** cabeçalho (título, data, regime), KPIs, cards A/B/C, aviso.
- **Sai:** header do site, hero, coluna de entradas, footer.
- **Glossário:** aparece na impressão nativa, **não** no PDF (decisão herdada; ver Roadmap para unificar).

## Regras
- Sempre tema claro (variáveis reforçadas em `.pdf-mode` e `@media print`).
- Cards não quebram no meio (`break-inside: avoid`); 1–2 páginas conforme campos preenchidos.
- Durante a geração o botão fica em estado `loading` e desabilitado; falha mostra toast e loga no console.

## Critérios de aceite
- [ ] PDF gerado com o site em tema escuro sai com fundo claro.
- [ ] Nome do arquivo: `Simulacao-CLT_<Regime>_<dd-mm-aaaa>.pdf`.
- [ ] Nenhum card cortado ao meio entre páginas.
- [ ] `html2pdf.js` não entra no bundle inicial (chunk separado).
