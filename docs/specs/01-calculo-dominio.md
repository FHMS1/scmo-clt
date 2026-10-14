# 01 — Regras de cálculo (domínio)

Implementação: `src/domain/` — funções puras. Entrada: `EntradaSimulacao`. Saída: `ResultadoSimulacao`.
Tabelas: `src/domain/tabelas2026.ts`. Testes: `src/domain/simulador.test.ts`.

## 1. Entradas
| Campo | Tipo | Regra |
|---|---|---|
| `regime` | `simples` \| `presumido` | |
| `simplesAnexoIV` | boolean | só no Simples: CPP 20% + RAT fora do DAS (ver spec 02) |
| `salarioBase` | R$ ≥ 0 | negativos/NaN → 0 |
| `periculosidade` | ativo + % | padrão 30%; incide sobre salário base |
| `gratificacao`, `comissao` | ativo + R$ mensal | integram a remuneração (CLT art. 457 §1º) |
| `valeTransporte` | ativo + R$ por passagem | 2 passagens × 22 dias |
| `valeAlimentacao` | ativo + R$ por dia | 22 dias |
| `grauRisco` | 1 \| 2 \| 3 | vem do CNAE (lista curada) ou manual; afeta Presumido e Simples Anexo IV |
| `fap` | 0,5 – 2,0 | vazio/0 → 1,0; fora da faixa é limitado (clamp) |

Campo com toggle **desativado** é ignorado, mesmo que tenha valor digitado.

## 2. Remuneração
```
periculosidade  = salárioBase × (% / 100)
remuneraçãoBruta = salárioBase + periculosidade + gratificação + comissão
```

## 3. Descontos do empregado
**INSS (progressivo, teto 8.475,55):** cada faixa sobre o seu intervalo.
| Faixa até | Alíquota |
|---|---|
| 1.621,00 | 7,5% |
| 2.902,84 | 9,0% |
| 4.354,27 | 12,0% |
| 8.475,55 | 14,0% |

**IRRF (Lei 15.270/2025, vigente desde 01/01/2026):**
```
dedução = max(INSS do empregado, desconto simplificado 607,20)   # 25% da faixa isenta
base    = max(0, remuneraçãoBruta − dedução)
imposto = tabela progressiva(base)                              # arredondado a centavos
```
| Base até | Alíquota | Dedução |
|---|---|---|
| 2.428,80 | 0 | 0 |
| 2.826,65 | 7,5% | 182,16 |
| 3.751,05 | 15% | 394,16 |
| 4.664,68 | 22,5% | 675,49 |
| acima | 27,5% | 908,73 |

**Redução**, apurada sobre o **rendimento bruto** (não sobre a base) e limitada ao imposto:
- bruto ≤ 5.000 → `min(imposto, 312,89)` (zera o IRRF)
- 5.000,01 a 7.350 → `min(imposto, max(0, 978,62 − 0,133145 × bruto))`
- > 7.350 → sem redução

Categoria: `isento` (imposto final 0), `reduzido` (houve redução e sobrou imposto), `cheio`.

**VT:** `bruto = passagem × 2 × 22`; `desconto = min(salárioBase × 6%, bruto)`; `custoEmpresa = bruto − desconto`.

## 4. Encargos da empresa
```
FGTS = remuneraçãoBruta × 8%                                   (ambos os regimes)
Lucro Presumido apenas:
  INSS patronal = remuneraçãoBruta × 20%
  RAT           = remuneraçãoBruta × (grau/100) × FAP
  Terceiros     = remuneraçãoBruta × 5,8%
Simples Nacional (Anexos I, II, III, V): INSS patronal, RAT e terceiros = 0 (dentro do DAS)
Simples Nacional — Anexo IV: INSS patronal 20% + RAT × FAP fora do DAS; sem terceiros
```

## 5. Totais
```
custoMensal  = remuneraçãoBruta + FGTS + INSSpatronal + RAT + terceiros + VTempresa + VA
custoHora    = custoMensal ÷ 220
líquidoFolha = remuneraçãoBruta − INSS − descontoVT − IRRF
totalRecebido = líquidoFolha + VTbruto + VA
```
**Provisões (fora do custo mensal):**
```
prov13   = remuneraçãoBruta ÷ 12
provTerço = remuneraçãoBruta ÷ 12 ÷ 3        # só o 1/3 constitucional
FGTS s/ 13º = prov13 × 8%     FGTS s/ terço = provTerço × 8%
totalProvisões = soma dos quatro
custoComProvisões = custoMensal + totalProvisões
```
> **Decisão (v5.1):** a remuneração das férias em si não é provisionada — é paga no lugar do salário do mês e não gera custo adicional; só o adicional de 1/3 e o FGTS sobre ele. README e glossário foram corrigidos para refletir isso.

## 6. Casos de aceite (espelhados nos testes)
| # | Cenário | Esperado |
|---|---|---|
| A1 | Simples, salário 3.000 | INSS 248,5998; dedução simplificada 607,20; IRRF 0 (isento); FGTS 240; custoMensal 3.240; líquido 2.751,4002 |
| A2 | Presumido, 3.000, grau 2, FAP 1 | INSS patr. 600; RAT 60; terceiros 174; custoMensal 4.074 |
| A3 | Presumido, 1.000, grau 3, FAP 5 | FAP limitado a 2 → RAT 60 |
| A4 | Salário 2.000 + peric. 30% + grat. 500 + com. 300 | bruta 3.400 |
| A5 | VT passagem 5, salário 2.000 | bruto 220; desconto 120; custo empresa 100 |
| A6 | VT passagem 1, salário 5.000 | desconto 44 (limitado ao benefício); custo empresa 0 |
| A7 | Salário 3.000, provisões | 13º 250; terço 83,33; FGTS 20 e 6,67; total 360 |
| A8 | Tudo zerado | nenhum NaN; custo 0 |
| A9 | Bruto 4.900 / 5.000 | IRRF 0 (isento) — corrige o resíduo do legado |
| A10 | Bruto 6.000 | dedução = INSS 641,51; redução = 978,62 − 0,133145×6.000; IRRF 385,10 |
| A11 | Bruto 7.350 | redução ≈ 0 (contínuo com a faixa > 7.350) |
| A12 | Simples Anexo IV, 3.000, grau 2, FAP 1 | CPP 600; RAT 60; terceiros 0; custoMensal 3.900 |

## 7. Atualização anual
Editar **somente** `src/domain/tabelas2026.ts` (renomear para o ano, ajustar `anoTabelas`):
1. `inssFaixas`, `inssTeto` — portaria MPS/MF do ano.
2. `irrfFaixas` e parâmetros de isenção/redução — RFB/legislação do ano.
3. `irrfDescontoSimplificado` — 25% do teto da faixa isenta do ano.
3. `terceiros`, `inssPatronal`, `fgts` — só se a legislação mudar.
4. Rodar `npm test`; atualizar casos A1–A9 se os números mudarem.
5. Conferir rótulos de ano em `Footer` e `Glossário`.

O `BannerAtualizacao` aparece sozinho quando o ano corrente > `anoTabelas`.

## 8. Decisões aplicadas na v5.1 e pendências

### Resolvido (fontes: Lei 15.270/2025 e orientação da RFB; Portaria Interministerial MPS/MF nº 13/2026)
| # | Ponto do legado | Decisão |
|---|---|---|
| 1 | Isenção ≤ 5.000 deixava resíduo de IRRF (ex.: 125,88 em 4.900) e usava `bruto − INSS` como critério das faixas | Faixas de redução usam o **rendimento bruto**; base do imposto usa a maior dedução (INSS ou simplificado 607,20); ≤ 5.000 zera o IRRF |
| 2 | Constante do redutor 979,62 (gerava salto de R$ 1,00 em 7.350) | **978,62**, que zera exatamente em 7.350 |
| 3 | Rótulo “INSS 2025” | Valores são 2026: Portaria Interministerial MPS/MF nº 13/2026. Rótulos corrigidos |
| 4 | Provisão de férias descrita como 1/12 | Mantido o código (só 1/3); textos corrigidos |
| 5 | Simples Anexo IV subestimado | Opção “Anexo IV” no Simples: CPP + RAT; sem terceiros |

### Ainda A VALIDAR
1. **Desconto simplificado = “a maior entre INSS e simplificado”.** O valor 607,20 e a regra do “mais vantajoso” seguem a orientação da RFB para fontes pagadoras; conferir se o sistema de folha do cliente adota o mesmo critério.
2. **Terceiros no Anexo IV:** assumido **zero** (optante do Simples não recolhe Sistema S fora do DAS). Confirmar por atividade.
3. **Encargos sobre provisões (Presumido/Anexo IV):** INSS patronal + RAT + terceiros incidem sobre 13º e 1/3 de férias, mas as provisões hoje só somam o FGTS. Decidir se entram no “custo com provisões”.
4. **Arredondamento:** só o IRRF é arredondado a centavos; demais valores sem arredondamento intermediário.
5. **22 dias fixos** para VT/VA; sem calendário real.
6. **13º salário:** o redutor também se aplica à tributação exclusiva do 13º; fora do escopo deste simulador.
