# 05 — Roadmap

Priorização: **P1** próximo ciclo · **P2** depois · **P3** ideia.

## Evolução visual (motivo da migração para React)
| P | Item | Notas |
|---|---|---|
| ✅ | Design system com tokens claro/escuro, ícones SVG, componentes e motion | v5.2 |
| ✅ | Barra de composição do custo (paleta validada, legenda com valores) | v5.2 |
| ✅ | Multiplicador custo ÷ remuneração nos KPIs | v5.2 |
| ✅ | Comparativo Simples × Anexo IV × Presumido (spec 02 R2) | v5.2 |
| P2 | Quebrar `app.css` em CSS Modules por componente | Hoje é um arquivo único organizado por seções |
| P2 | Microinterações: transições de seção ao ligar/desligar regime e toggles | Respeitar reduced-motion |
| P2 | Densidade responsiva dos cards de resultado em mobile | |
| P3 | Marca configurável (logo/cor/nome do escritório) no cabeçalho do PDF | |

## Evolução funcional
| P | Item |
|---|---|
| P1 | Resolver os **A VALIDAR** restantes da spec 01 §8 (inclui encargos sobre provisões) |
| ✅ | Simples Anexo IV (spec 02 R1) — v5.1 |
| P2 | Dependentes e deduções no IRRF |
| P2 | Horas extras, adicional noturno, DSR, insalubridade |
| P2 | Salvar/carregar simulação (JSON local, URL com query) |
| P3 | Múltiplos empregados / quadro de funcionários com total |
| P3 | Rescisão e aviso prévio |
| P3 | CNAE completo (Anexo V) com busca |

## Engenharia
| P | Item |
|---|---|
| P1 | CI: `typecheck` + `test` + `build` |
| P1 | Testes de componente (Testing Library) para fluxos críticos: trocar regime, toggles, limpar |
| P2 | Teste visual/regressão do PDF |
| P2 | Deploy estático (GitHub Pages ou similar) |
| P3 | i18n (hoje só pt-BR) |

## Decisões em aberto
Ver spec 01 §8 (cálculo) e spec 02 (regimes). Cada item aprovado vira caso de aceite antes do código.
