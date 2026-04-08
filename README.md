# Simulador de Custo de Mão de Obra CLT
**Êxito Contábil · v4.0**

Ferramenta web para simulação do custo real mensal de um empregado CLT no Brasil. Desenvolvida para uso contábil e empresarial, com cálculo em tempo real, separação clara entre desembolso mensal e provisões, e suporte a dois regimes tributários.

---

## Funcionalidades

- **Cálculo em tempo real** a cada alteração de campo
- **Dois regimes tributários:** Simples Nacional e Lucro Presumido (com encargos patronais)
- **INSS progressivo** pela tabela 2025 (4 faixas)
- **IRRF 2026** com isenção até R$ 5.000 (MP 1.294/2024) e redução progressiva até R$ 7.350
- **Separação entre custo mensal real** (desembolso efetivo) **e provisões** (13º, férias, 1/3)
- **Benefícios:** vale-transporte com desconto legal de 6% e vale-alimentação
- **Adicional de periculosidade** com percentual editável (padrão 30%)
- **Glossário interativo** com base legal citada, expansível por clique
- **Impressão / PDF** formatado em página única, otimizado para A4
- **Arquivo único** — funciona offline, sem dependências externas de runtime

---

## Estrutura da Interface

```
┌─────────────────────────────────────────────────────────────┐
│  Header fixo — Logo Êxito Contábil                          │
├─────────────────────────────────────────────────────────────┤
│  Hero — Título + Botões de ação (Limpar · PDF · Imprimir)   │
├────────────────────┬────────────────────────────────────────┤
│  Coluna Esquerda   │  Coluna Direita                        │
│  ──────────────    │  ──────────────                        │
│  Bloco 1           │  KPIs rápidos (4 cards)                │
│  Regime Tributário │                                        │
│                    │  Card A — Folha a Pagar                │
│  Bloco 2           │  (Custo mensal real da empresa)        │
│  Dados do Empregado│                                        │
│  · Salário base    │  Card B — O que o Trabalhador Recebe   │
│  · Periculosidade  │  (Líquido folha + benefícios)          │
│  · Vale-transporte │                                        │
│  · Vale-alimentação│  Card C — Provisões                    │
│                    │  (13º · Férias · 1/3 — separados)      │
│  Bloco 3           │                                        │
│  Tabela IRRF 2026  │  Aviso legal                           │
├────────────────────┴────────────────────────────────────────┤
│  Glossário interativo (accordion — 12 termos com base legal)│
├─────────────────────────────────────────────────────────────┤
│  Footer                                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Regras de Cálculo

### Remuneração
```
remuneraçãoBruta = salárioBase + adicionalPericulosidade
adicionalPericulosidade = salárioBase × (percentual / 100)
```

### INSS do Empregado — Tabela Progressiva 2025
| Faixa | Até | Alíquota |
|---|---|---|
| 1ª | R$ 1.621,00 | 7,5% |
| 2ª | R$ 2.902,84 | 9,0% |
| 3ª | R$ 4.354,27 | 12,0% |
| 4ª | R$ 8.475,55 | 14,0% |

Cada faixa é calculada individualmente sobre o intervalo correspondente (cálculo progressivo, não regressivo).

### IRRF 2026 — Tabela + Isenção MP 1.294/2024
**Base de cálculo:** `remuneraçãoBruta − INSS`

| Base | Alíquota | Dedução |
|---|---|---|
| Até R$ 2.428,80 | Isento | — |
| R$ 2.428,81 – R$ 2.826,65 | 7,5% | R$ 182,16 |
| R$ 2.826,66 – R$ 3.751,05 | 15% | R$ 394,16 |
| R$ 3.751,06 – R$ 4.664,68 | 22,5% | R$ 675,49 |
| Acima de R$ 4.664,68 | 27,5% | R$ 908,73 |

**Aplicação da isenção:**
- Base ≤ R$ 5.000,00 → imposto zerado (desconto de até R$ 312,89)
- R$ 5.000,01 a R$ 7.350,00 → `redução = 979,62 − (0,133145 × base)`
- Acima de R$ 7.350,01 → sem redução

### FGTS
```
FGTS = remuneraçãoBruta × 8%
```

### Encargos Patronais — Lucro Presumido
```
INSS Patronal   = remuneraçãoBruta × 20%
RAT/FAP         = remuneraçãoBruta × alíquotaRAT (1%, 2% ou 3%)
Terceiros (S)   = remuneraçãoBruta × 5,8%
```
> No Simples Nacional esses encargos estão incluídos na DAS e **não** são somados ao custo.

### Vale-Transporte
```
valorMensalVT  = valorPassagem × 2 passagens × 22 dias
descontoEmpregado = min(salárioBase × 6%, valorMensalVT)
custoEmpresaVT = valorMensalVT − descontoEmpregado
```

### Vale-Alimentação
```
valorMensalVA = valorDiário × 22 dias úteis
```
Tratado como custo integral da empresa. Não integra o salário nem sofre desconto em folha.

### Custo Mensal Real da Empresa
```
custoMensal = remuneraçãoBruta
            + FGTS
            + INSS Patronal (se LP)
            + RAT/FAP (se LP)
            + Terceiros (se LP)
            + custoEmpresaVT
            + valorMensalVA

custoHora = custoMensal ÷ 220h
```
> **Provisões não entram neste total.** São calculadas à parte.

### Provisões Mensais
```
provisão13º    = remuneraçãoBruta ÷ 12
provisãoFérias = remuneraçãoBruta ÷ 12
provisão1/3    = provisãoFérias ÷ 3
totalProvisões = provisão13º + provisãoFérias + provisão1/3
```

### Líquido do Trabalhador
```
líquidoFolha   = remuneraçãoBruta − INSS − descontoVT − IRRF
totalRecebido  = líquidoFolha + valorMensalVT + valorMensalVA
```

---

## Tecnologia

| Item | Detalhe |
|---|---|
| Stack | HTML5 + CSS3 + JavaScript ES6+ puro |
| Fontes | Google Fonts — Sora (interface) + DM Mono (valores numéricos) |
| Logo | PNG embutido via base64 com `mix-blend-mode: screen` |
| Frameworks | Nenhum |
| Dependências runtime | Nenhuma |
| Compatibilidade | Chrome, Firefox, Edge, Safari (modernos) |
| Responsividade | Grid 2 colunas (desktop) → 1 coluna (≤ 940px) |

---

## Organização do Código

O arquivo `simulador-clt.html` está organizado em 4 seções:

```
1. <style>          — Todo o CSS (variáveis, layout, componentes, print)
2. <body> HTML      — Estrutura: header · hero · main (2 colunas) · glossário · footer
3. CONFIG object    — Todas as tabelas e alíquotas isoladas (atualizar aqui a cada ano)
4. <script>         — Funções de cálculo, UI e ações
```

### Objeto CONFIG
Todos os parâmetros que mudam anualmente estão centralizados:

```javascript
const CONFIG = {
  inss_faixas:            [...],   // tabela progressiva INSS
  inss_teto:              8475.55,
  irrf_faixas:            [...],   // tabela progressiva IRRF 2026
  irrf_isencao_teto:      5000.00, // MP 1.294/2024
  irrf_reducao_teto:      7350.00,
  irrf_desconto_max:       312.89,
  irrf_reducao_constante:  979.62,
  irrf_reducao_fator:      0.133145,
  inss_patronal:          0.20,
  terceiros:              0.058,
  fgts:                   0.08,
  vt_desc_pct:            0.06,
  vt_passagens:           2,
  vt_dias:                22,
  va_dias:                22,
  horas_mes:              220,
};
```

### Funções Principais

| Função | Descrição |
|---|---|
| `calcular()` | Recalcula todos os valores e atualiza o DOM |
| `calcINSS(base)` | INSS progressivo — retorna valor do desconto |
| `calcIRRF(base)` | IRRF 2026 com isenção — retorna `{ impostoFinal, impostoBruto, reducao, categoria }` |
| `onRegime()` | Alterna entre Simples Nacional e Lucro Presumido |
| `toggleSub(chkId, divId, rowId)` | Abre/fecha sub-campos dos toggles |
| `toggleGlos(trigger)` | Abre/fecha item do glossário (accordion) |
| `salvarPDF()` | Aciona `window.print()` com layout otimizado para A4 |
| `limpar()` | Reseta todos os campos ao estado inicial |

---

## Impressão / PDF

Ao clicar em **Salvar PDF** ou **Imprimir**, o navegador abre o diálogo nativo. Para salvar como PDF, selecione "Salvar como PDF" como destino da impressão.

**O que aparece no PDF:**
- Header limpo com nome da ferramenta, empresa e data de geração
- KPIs em 4 colunas
- Cards A, B e C (resultados completos)
- Aviso legal
- Glossário (opcional — visível se aberto)

**O que é ocultado no PDF:**
- Header sticky do site
- Hero e botões de ação
- Coluna de inputs (Blocos 1, 2 e 3)
- Footer

---

## Atualização Anual

Para atualizar as tabelas ao início de cada ano, edite **apenas o objeto `CONFIG`** no `<script>`:

1. **INSS** → atualizar `inss_faixas` e `inss_teto` conforme portaria MPS/MF
2. **IRRF** → atualizar `irrf_faixas` conforme tabela Receita Federal
3. **Isenção IRRF** → atualizar `irrf_isencao_teto`, `irrf_reducao_teto`, `irrf_desconto_max`, `irrf_reducao_constante` e `irrf_reducao_fator`
4. **Encargos Terceiros** → verificar se alíquotas do Sistema S foram alteradas em `terceiros`

Também atualizar a tabela visual do IRRF no HTML (Bloco 3 — card da coluna esquerda).

---

## Limitações (v4.0)

Esta versão **não considera:**
- IRRF com deduções legais (dependentes, pensão alimentícia, previdência privada)
- Horas extras e adicional noturno
- Faltas e DSR (Descanso Semanal Remunerado)
- Insalubridade
- Rescisão e cálculos de aviso prévio
- Convenção coletiva
- Pensão alimentícia
- Simples Nacional com anexos diferenciados por atividade

---

## Licença e Uso

Ferramenta de uso exclusivo da **Êxito Contábil**. Desenvolvida para estimativas e simulações internas. Os valores gerados não substituem a elaboração da folha de pagamento por profissional habilitado.

---

*Êxito Contábil · Simulador CLT v4.0 · Tabelas INSS 2025 e IRRF 2026*
