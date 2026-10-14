# Specs — Simulador de Custo de Mão de Obra CLT

Especificações do produto. São a fonte de verdade do **o quê** e do **porquê**; o código é o **como**.

| # | Spec | Assunto | Status |
|---|---|---|---|
| 00 | [Visão do produto](00-visao-produto.md) | Problema, público, escopo, princípios | Vigente |
| 01 | [Regras de cálculo](01-calculo-dominio.md) | Fórmulas, tabelas, casos de aceite, pontos a validar | Vigente (v5.1 — IRRF Lei 15.270) |
| 02 | [Regimes tributários](02-regimes-tributarios.md) | Simples Nacional × Lucro Presumido, evolução | Vigente + proposta |
| 03 | [Interface](03-interface.md) | Telas, componentes, estados, acessibilidade | Vigente |
| 04 | [Exportação](04-exportacao.md) | PDF e impressão | Vigente |
| 05 | [Roadmap](05-roadmap.md) | Evolução visual e funcional priorizada | Proposta |

## Como usar

- **Mudou regra de cálculo?** Atualize a spec 01 (ou 02) **antes** do código e adicione um caso de aceite na tabela. O teste em `src/domain/simulador.test.ts` deve refletir a tabela.
- **Mudou tabela anual (INSS/IRRF)?** Siga o procedimento da spec 01 §7. Só `src/domain/tabelas2026.ts` muda.
- **Ponto ainda não decidido** fica marcado como `⚠️ A VALIDAR` — não implemente nem “corrija” sem decisão do responsável contábil.
- Cada spec tem **critérios de aceite** verificáveis. Uma feature só está pronta quando eles passam.
