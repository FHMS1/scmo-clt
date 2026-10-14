# 02 — Regimes tributários

## Resumo
| Item | Simples Nacional (hoje) | Lucro Presumido |
|---|---|---|
| FGTS 8% | ✔ | ✔ |
| INSS patronal 20% (CPP) | ✘ (dentro do DAS) — **✔ no Anexo IV** | ✔ |
| RAT × FAP | ✘ (dentro do DAS) — **✔ no Anexo IV** | ✔ grau × FAP |
| Terceiros (Sistema S) 5,8% | ✘ | ✔ |
| Desconto do empregado (INSS/IRRF/VT) | igual | igual |
| Provisões | igual | igual (base inclui a remuneração, não os encargos) |

A diferença de custo entre regimes é, portanto, **somente** `INSS patronal + RAT + terceiros` (no Anexo IV, sem terceiros).

## Comportamento na UI
- Seletor de regime (Bloco 1) alterna duas pílulas.
- Em **Lucro Presumido** aparecem: CNAE/grau de risco, FAP e o resumo de encargos; o card de folha mostra as 3 linhas patronais.
- Em **Simples**, a opção “Atividade do Anexo IV” (checkbox) liga CPP + RAT: aparecem CNAE, FAP e as linhas de INSS patronal e RAT, sem terceiros. Desligada, tudo fica oculto e zerado.
- O rótulo do regime no PDF vira “Simples Nacional (Anexo IV)”.
- O regime sai no cabeçalho do PDF.

## Grau de risco (RAT)
Lista curada de 14 CNAEs em `src/domain/cnae.ts` (grau 1, 2 ou 3 → 1%, 2%, 3%). Fora da lista: “Outra atividade” libera seleção manual. O Anexo V do Decreto 3.048/1999 tem ~1.300 subclasses; a lista é um subconjunto verificado, **não** substitui a consulta.
FAP é sempre informado pelo usuário (extrato do CNPJ), limitado a 0,5–2,0.

## Evolução proposta (aguardando decisão do responsável contábil)
| ID | Proposta | Observação |
|---|---|---|
| R1 | ✅ **Implementado (v5.1)** — Simples Anexo IV: CPP 20% + RAT fora do DAS | Opção manual no formulário; terceiros assumido zero (A VALIDAR). |
| R2 | ✅ **Implementado (v5.2)** — comparativo lado a lado | `compararRegimes()` em `domain/analise.ts`; mostra os 3 enquadramentos. |
| R3 | **Desoneração da folha** (CPRB) para CNAEs elegíveis | Substitui 20% patronal por alíquota sobre receita; exige receita bruta. |
| R4 | **Lucro Real** | Mesmos encargos do Presumido na folha; diferença está no IRPJ/CSLL, fora do escopo de MOD. |
| R5 | **Terceiros por CNAE** (FPAS) | Hoje fixo em 5,8%; Simples e outros FPAS têm alíquotas distintas. |

## Critérios de aceite
- [ ] `simular({regime:'simples', simplesAnexoIV:false})` não depende de `grauRisco`/`fap`.
- [ ] Anexo IV: `custo − custo(Simples comum) = CPP + RAT`; terceiros = 0; flag ignorada no Presumido.
- [ ] `custoMensal(presumido) − custoMensal(simples) = INSSpatr + RAT + terceiros` (mesmo restante).
- [ ] UI oculta/mostra campos conforme o regime sem perder o que foi digitado.
