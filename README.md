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
- **Gratificação e comissão** com integração à remuneração (INSS, IRRF, FGTS, encargos e provisões)
- **RAT × FAP separados:** grau de risco por atividade (CNAE) e FAP homologado informado à parte
- **Glossário em painel mestre-detalhe** (lista de termos + detalhe, com base legal citada)
- **Tema claro/escuro** com detecção automática do sistema e preferência salva no navegador
- **Impressão / PDF** compacto, otimizado para A4, sempre no tema claro (mesmo com o site em modo escuro)
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
remuneraçãoBruta = salárioBase + adicionalPericulosidade + gratificação + comissão
adicionalPericulosidade = salárioBase × (percentual / 100)
```
Gratificação e comissão são informadas em valor mensal (R$) e integram a remuneração para todos os efeitos legais (CLT, Art. 457, §1º) — entram na base de INSS, IRRF, FGTS, encargos patronais e provisões.

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
RAT             = remuneraçãoBruta × grauRisco (1%, 2% ou 3%, conforme CNAE/atividade) × FAP (0,5 a 2,0)
Terceiros (S)   = remuneraçãoBruta × 5,8%
```
> No Simples Nacional esses encargos estão incluídos na DAS e **não** são somados ao custo.
> O FAP é sempre informado manualmente pelo usuário a partir do extrato oficial homologado no CNPJ (0,5 a 2,0) — é calculado anualmente pelo INSS por empresa, não podendo ser deduzido do CNAE.

### Grau de Risco por Atividade (CNAE)

O grau de risco (1/2/3 → 1%/2%/3%) pode ser selecionado de duas formas:

1. **Lista curada** — 14 CNAEs comuns, verificados individualmente (código + descrição + grau, cruzando o percentual RAT com a classificação leve/médio/grave, não uma tabela raspada de terceiros). Cobre serviços profissionais, comércio, hotelaria/alimentação e atividades de maior risco (construção, transporte, oficina).
2. **"Outra atividade"** — libera um seletor manual (1%/2%/3%), para quando o CNAE do cliente não está na lista curada. Sempre confirmar o grau oficial no Anexo V do Decreto nº 3.048/1999.

> ⚠️ O Anexo V oficial tem ~1.300 subclasses de CNAE (Decreto nº 3.048/1999, redação do Decreto nº 6.957/2009; detalhado na IN RFB nº 971/2009). A lista curada aqui é um subconjunto para agilizar os casos mais comuns da carteira de clientes — não substitui a consulta ao Anexo V para atividades fora dela.

| CNAE | Atividade | Grau |
|---|---|---|
| 6920-6/01 | Serviços de contabilidade | 1 (leve) |
| 6201-5/01 | Desenvolvimento de programas sob encomenda (TI) | 1 (leve) |
| 8630-5/03 | Atividade médica ambulatorial — consultas | 1 (leve) |
| 8599-6/04 | Treinamento profissional e gerencial | 1 (leve) |
| 4781-4/00 | Comércio varejista de vestuário e acessórios | 2 (médio) |
| 6810-2/02 | Aluguel de imóveis próprios (imobiliária) | 2 (médio) |
| 8211-3/00 | Escritório e apoio administrativo | 2 (médio) |
| 5510-8/01 | Hotéis | 2 (médio) |
| 9602-5/01 | Cabeleireiros, manicure e pedicure | 2 (médio) |
| 5611-2/01 | Restaurantes e similares | 2 (médio) |
| 4120-4/00 | Construção de edifícios | 3 (grave) |
| 4711-3/02 | Comércio varejista de mercadorias em geral (supermercado) | 3 (grave) |
| 4930-2/02 | Transporte rodoviário de carga | 3 (grave) |
| 4520-0/01 | Manutenção e reparação de veículos automotores | 3 (grave) |

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
| Responsividade | Grid 2 colunas (desktop) → 1 coluna (≤ 940px) → 1 coluna compacta (≤ 480px) |
| Tema | Claro/escuro via `data-theme` + custom properties; resolvido antes do primeiro paint (sem flash) |

### Design tokens

Todas as cores são `custom properties` em `css/styles.css`, com dois papéis distintos:

- **Chrome** (`--chrome`, `--chrome-dark`) — fundo do header, hero, footer e bandas escuras. Fixo nos dois temas (são superfícies "de marca", não superfícies de página).
- **Accent/neutros** (`--teal`, `--gray-*`, `--green`, `--amber`, `--red`, `--purple`, cada um com uma variante `-light`) — adaptam entre claro e escuro via `:root[data-theme="dark"]`.

O PDF (`salvarPDF()`) e a impressão nativa (`@media print`) reforçam as variáveis do tema claro explicitamente, porque custom properties herdam do `<html data-theme="dark">` — sem isso, gerar um PDF com o site em modo escuro sairia com fundo escuro.

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
| `renderGlossario()` / `selectGlos(id)` | Monta a lista do glossário a partir do array `GLOSSARIO` e troca o termo exibido no painel de detalhe |
| `toggleTheme()` | Alterna entre tema claro/escuro e salva a preferência no `localStorage` |
| `salvarPDF()` | Gera o PDF via `html2pdf.js` (html2canvas + jsPDF), em modo compacto (`.pdf-mode`), sempre no tema claro |
| `imprimir()` | Aciona `window.print()` nativo do navegador, com layout otimizado via `@media print` |
| `limpar()` | Reseta todos os campos ao estado inicial |

---

## Impressão / PDF

Existem dois caminhos de exportação, com motores diferentes:

- **Salvar PDF** (`salvarPDF()`) — renderiza a coluna de resultados via `html2pdf.js` (html2canvas + jsPDF) e baixa o arquivo diretamente, sem diálogo do navegador. Usa a classe `.pdf-mode` (`css/styles.css`) para compactar espaçamentos e fontes — esse CSS não depende de `@media print`, porque o html2canvas captura o DOM como ele está na tela, não a versão de impressão.
- **Imprimir** (`imprimir()`) — abre o diálogo nativo de impressão do navegador (`window.print()`), que usa as regras de `@media print` do `styles.css` (visual ligeiramente diferente do PDF gerado por `salvarPDF()`).

**O que aparece nos dois:**
- Header limpo com nome da ferramenta, empresa e data de geração
- KPIs em 4 colunas
- Cards A, B e C (resultados completos)

**O que é ocultado nos dois:**
- Header sticky do site, hero e botões de ação
- Coluna de inputs (Blocos 1, 2 e 3)
- Footer e aviso legal

**Diferença entre os dois:** o glossário aparece na impressão nativa (`imprimir()`, via `@media print`), mas **não** no PDF gerado por `salvarPDF()` (sempre oculto). Se quiserem consistência entre os dois formatos, é só ajustar o seletor `ocultar` em `salvarPDF()`.

**Paginação:** o modo `.pdf-mode` usa `page-break-inside: avoid` nos cards para evitar que um card seja cortado no meio entre páginas — a quebra sempre cai entre cards, nunca no meio de uma linha. Dependendo de quantos campos opcionais estiverem preenchidos (periculosidade, VT, VA, gratificação, comissão, regime Lucro Presumido), a simulação sai em 1 ou 2 páginas A4.

**Logo local:** o logo é embutido como base64 diretamente no HTML (não referenciado como arquivo externo). Isso é necessário porque `html2canvas` marca o canvas como "tainted" (e o PDF falha silenciosamente) quando a página é aberta localmente via `file://` e a imagem vem de um arquivo externo — o navegador trata origens `file://` como opacas por padrão.

---

## Atualização Anual

Para atualizar as tabelas ao início de cada ano, edite **apenas o objeto `CONFIG`** no `<script>`:

1. **INSS** → atualizar `inss_faixas` e `inss_teto` conforme portaria MPS/MF
2. **IRRF** → atualizar `irrf_faixas` conforme tabela Receita Federal
3. **Isenção IRRF** → atualizar `irrf_isencao_teto`, `irrf_reducao_teto`, `irrf_desconto_max`, `irrf_reducao_constante` e `irrf_reducao_fator`
4. **Encargos Terceiros** → verificar se alíquotas do Sistema S foram alteradas em `terceiros`
5. **Grau de risco por CNAE** → o Anexo V do Decreto nº 3.048/1999 raramente muda, mas vale conferir a lista curada (`<select id="cnaeAtividade">` no `index.html`) se algum CNAE dos clientes mudar de enquadramento

Também atualizar a tabela visual do IRRF no HTML (Bloco 3 — card da coluna esquerda).

---

## Limitações (v4.0)

Esta versão **não considera:**
- IRRF com deduções legais (dependentes, pensão alimentícia, previdência privada)
- Horas extras e adicional noturno
- Faltas e DSR (Descanso Semanal Remunerado)
- DSR sobre comissões (reflexo do descanso semanal sobre a média variável)
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
