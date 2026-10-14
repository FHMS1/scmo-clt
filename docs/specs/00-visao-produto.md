# 00 — Visão do produto

## Problema
Empresários e a equipe contábil precisam **demonstrar** quanto um empregado CLT realmente custa para a empresa — e quanto ele de fato recebe — para decidir contratações, precificar serviços e explicar a diferença entre salário e custo. Hoje isso é feito em planilha, de forma inconsistente entre regimes tributários.

## Proposta
Uma planilha web interativa de **demonstração de custo de mão de obra CLT** que:

1. Recebe poucos dados (salário, adicionais, benefícios, regime).
2. Mostra em tempo real o **custo mensal da empresa**, o **líquido do trabalhador** e as **provisões**.
3. Diferencia **Simples Nacional** e **Lucro Presumido** (encargos patronais).
4. Gera um PDF/impressão limpo para entregar ao cliente.

## Público
- **Primário:** equipe contábil apresentando a simulação ao cliente.
- **Secundário:** empresário/gestor que usa a ferramenta sozinho.

## Princípios
- **Estimativa, não folha.** Sempre deixar claro que não substitui a folha de pagamento real.
- **Custo real separado de provisão.** O desembolso mensal nunca mistura 13º/férias; provisões ficam em bloco próprio.
- **Transparência.** Cada número tem rótulo, alíquota e base legal acessível (glossário).
- **Tabelas isoladas.** Valores que mudam por ano/portaria vivem em um único arquivo.
- **Cálculo testável.** Regra de negócio é função pura, sem DOM.
- **Funciona offline** após carregado; sem backend, sem dados do usuário enviados a terceiros.

## Fora de escopo (v5)
Folha completa (horas extras, DSR, faltas, insalubridade), rescisão, convenção coletiva, pensão, dependentes no IRRF, multi-empregados, persistência em servidor. Ver [Roadmap](05-roadmap.md).

## Critérios de aceite do produto
- [ ] Digitar salário atualiza todos os cards sem ação adicional.
- [ ] Alternar regime altera custo mensal conforme spec 02.
- [ ] PDF e impressão saem sempre no tema claro, em 1–2 páginas A4.
- [ ] Funciona em 360px de largura e em desktop 1280px+.
- [ ] Aviso de estimativa visível na tela e no PDF.
