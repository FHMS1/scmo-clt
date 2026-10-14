
export const dataHoje = () => new Date().toLocaleDateString('pt-BR');

/** Impressão nativa — o layout vem das regras @media print do CSS. */
export function imprimir() {
  window.print();
}

/**
 * Gera o PDF a partir de clones do cabeçalho e da coluna de resultados, em modo
 * compacto (.pdf-mode). html2pdf.js é carregado sob demanda (chunk separado).
 */
export async function salvarPdf(
  regime: string,
  cabecalho: HTMLElement,
  resultados: HTMLElement,
): Promise<void> {
  const { default: html2pdf } = await import('html2pdf.js');
  const nome = `Simulacao-CLT_${regime.replace(/[^\wÀ-ÿ]+/g, '-').replace(/-+$/, '')}_${dataHoje().replace(/\//g, '-')}.pdf`;

  const wrapper = document.createElement('div');
  wrapper.className = 'pdf-mode';
  wrapper.style.cssText = 'padding:10px; background:#f7f9fb;';
  wrapper.append(cabecalho.cloneNode(true), resultados.cloneNode(true));

  // `pagebreak` é suportado em runtime, mas ausente nos tipos da lib — daí a variável intermediária.
  const opcoes = {
    margin: [6, 6, 6, 6] as [number, number, number, number],
    filename: nome,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
    pagebreak: { mode: ['css'] },
  };

  await html2pdf()
    .set(opcoes)
    .from(wrapper)
    .save();
}
