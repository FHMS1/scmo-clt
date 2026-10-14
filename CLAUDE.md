# CLAUDE.md

@AGENTS.md

## A ideia do projeto
**Planilha web de demonstração de custo de mão de obra CLT**. Mostra, em tempo real, quanto um empregado custa para a empresa, quanto ele recebe e o que deve ser provisionado — considerando **Simples Nacional** e **Lucro Presumido**.

Nasceu como um HTML/JS único (v4.0, hoje em `legacy/`) e está sendo evoluída para **React + TypeScript** para permitir evolução visual e funcional sustentável.

Uso real: a equipe contábil apresenta a simulação ao cliente e entrega PDF. É **estimativa**, nunca a folha de pagamento.

## Como trabalhar aqui
1. **Leia a spec antes de mexer em regra.** `docs/specs/01-calculo-dominio.md` e `02-regimes-tributarios.md` mandam; o código segue.
2. **Regra de negócio só em `src/domain`**, como função pura, com teste. Componentes só apresentam.
3. **Specs mandam.** Itens em “Ainda A VALIDAR” (spec 01 §8) não devem ser decididos por iniciativa própria — levante a dúvida ao usuário (contador responsável). Decisões legais devem citar fonte.
4. **Tabelas anuais** ficam só em `src/domain/tabelas2026.ts`.
5. **Mudou comportamento?** Atualize a spec e os testes no mesmo passo.
6. **Não edite `legacy/`.**
7. Valide com `npm run typecheck && npm test && npm run build` antes de dizer que terminou.

## Convenções rápidas
- Interface e termos de negócio em **português do Brasil**.
- Não inventar alíquota, portaria ou artigo de lei. Se não tiver certeza da norma, registre como A VALIDAR.
- Preferir editar o que existe a criar abstração nova; manter dependências mínimas.
- Visual: reutilizar tokens CSS; PDF/impressão sempre em tema claro.

## Onde está cada coisa
Estrutura completa, fluxo de dados e comandos: [AGENTS.md](AGENTS.md). Roadmap de evolução: `docs/specs/05-roadmap.md`.
