# Simulador de Custo de Mão de Obra CLT
**v5.1** — React + TypeScript

Planilha web de demonstração do **custo real de um empregado CLT**, com cálculo em tempo real para **Simples Nacional** e **Lucro Presumido**: custo mensal da empresa, líquido do trabalhador e provisões, com PDF/impressão para entregar ao cliente.

> Estimativa para fins de simulação. Não substitui a folha de pagamento elaborada por profissional habilitado.

## Funcionalidades
- Cálculo em tempo real a cada alteração
- Regimes: Simples Nacional (com opção Anexo IV) e Lucro Presumido (INSS patronal, RAT×FAP, terceiros)
- INSS progressivo 2026 e IRRF com desconto simplificado e redutor da Lei 15.270/2025
- Periculosidade, gratificação e comissão integrando a remuneração
- Vale-transporte (desconto de 6%) e vale-alimentação
- Custo mensal real **separado** das provisões (13º e 1/3 de férias, com FGTS)
- RAT por CNAE (lista curada) × FAP informado
- Glossário com base legal · tema claro/escuro
- Salvar PDF compacto (A4) e imprimir

## Rodando
```bash
npm install
npm run dev        # desenvolvimento
npm test           # testes do domínio
npm run build      # produção em dist/
```
Requer Node 20+.

## Documentação
| Documento | Conteúdo |
|---|---|
| [CLAUDE.md](CLAUDE.md) | Ideia do projeto e regras de trabalho |
| [AGENTS.md](AGENTS.md) | Estrutura completa, fluxo, convenções |
| [docs/specs/](docs/specs/README.md) | Especificações: cálculo, regimes, interface, exportação, roadmap |

## Estrutura resumida
```
src/domain/       regra de negócio pura (cálculo, tabelas, CNAE, glossário) + testes
src/components/   interface React
src/hooks/        tema e toast
src/services/     exportação (PDF/impressão)
legacy/           versão 4.0 em HTML/JS puro (referência)
docs/specs/       especificações
```

## Atualização anual
Editar apenas `src/domain/tabelas2026.ts` e rodar `npm test` (procedimento em `docs/specs/01-calculo-dominio.md` §7).

## Limitações
Não considera: deduções no IRRF (dependentes, pensão, previdência privada), horas extras/adicional noturno, faltas/DSR, insalubridade, rescisão, convenção coletiva, encargos patronais sobre as provisões de 13º e 1/3. Veja `docs/specs/05-roadmap.md`.

## Licença
Ver [LICENSE](LICENSE).
