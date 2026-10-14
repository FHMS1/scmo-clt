import { useCallback, useMemo, useRef, useState } from 'react';
import { BannerAtualizacao, Footer, Header, Hero, PdfHeader } from './components/Chrome';
import { Glossario } from './components/Glossario';
import { InputsColumn } from './components/InputsColumn';
import { ResultsColumn } from './components/ResultsColumn';
import { FORM_INICIAL, formParaEntrada, type FormState } from './domain/formulario';
import { regimeLabel } from './domain/format';
import { simular } from './domain/simulador';
import { useTheme } from './hooks/useTheme';
import { useToast } from './hooks/useToast';
import { imprimir, salvarPdf } from './services/exportar';

export function App() {
  const [form, setForm] = useState<FormState>(FORM_INICIAL);
  const [gerandoPdf, setGerandoPdf] = useState(false);
  const { alternar } = useTheme();
  const toast = useToast();
  const cabecalhoRef = useRef<HTMLDivElement>(null);
  const resultadosRef = useRef<HTMLDivElement>(null);

  const resultado = useMemo(() => simular(formParaEntrada(form)), [form]);

  const rotuloRegime = regimeLabel(resultado.regime, resultado.simplesAnexoIV);

  const alterar = useCallback(<K extends keyof FormState>(campo: K, valor: FormState[K]) => {
    setForm((f) => ({ ...f, [campo]: valor }));
  }, []);

  const limpar = () => {
    setForm(FORM_INICIAL);
    toast.mostrar('↺ Simulação limpa');
  };

  const pdf = async () => {
    if (!cabecalhoRef.current || !resultadosRef.current) return;
    setGerandoPdf(true);
    try {
      await salvarPdf(rotuloRegime, cabecalhoRef.current, resultadosRef.current);
      toast.mostrar('PDF gerado com sucesso');
    } catch (erro) {
      console.error(erro);
      toast.mostrar('Erro ao gerar PDF — veja o console para detalhes');
    } finally {
      setGerandoPdf(false);
    }
  };

  return (
    <>
      <Header />
      <Hero gerandoPdf={gerandoPdf} onLimpar={limpar} onPdf={pdf} onImprimir={imprimir} onTema={alternar} />
      <BannerAtualizacao />
      <PdfHeader ref={cabecalhoRef} regime={rotuloRegime} />
      <main>
        <InputsColumn form={form} onChange={alterar} resultado={resultado} />
        <ResultsColumn ref={resultadosRef} resultado={resultado} />
      </main>
      <Glossario />
      <Footer />
      <div id="toast" className={toast.visivel ? 'show' : ''} role="status">{toast.mensagem}</div>
    </>
  );
}
