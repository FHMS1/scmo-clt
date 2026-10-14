import { useState } from 'react';
import { GLOSSARIO } from '../domain/glossario';
import { Icon } from './ui';

export function Glossario() {
  const [id, setId] = useState(GLOSSARIO[0].id);
  const termo = GLOSSARIO.find((t) => t.id === id) ?? GLOSSARIO[0];

  return (
    <section className="glossario-section">
      <div className="glossario-inner">
        <div className="glos-header">
          <span className="glos-icon"><Icon name="book" /></span>
          <div>
            <h2>Glossário e Base Legal</h2>
            <p>Entenda o significado de cada termo utilizado nesta simulação e a legislação que o fundamenta</p>
          </div>
        </div>
        <div className="glos-panel">
          <div className="glos-list" role="listbox" aria-label="Termos do glossário">
            {GLOSSARIO.map((t) => (
              <button key={t.id} type="button" className="glos-item" role="option"
                aria-selected={t.id === id} onClick={() => setId(t.id)}>
                <span className="glos-item-tag">{t.tag}</span>
                <span className="glos-item-title">{t.title}</span>
              </button>
            ))}
          </div>
          <div className="glos-detail" key={termo.id}>
            <span className="glos-detail-tag">{termo.tag}</span>
            <h3 className="glos-detail-title">{termo.title}</h3>
            <p className="glos-detail-desc">{termo.desc}</p>
            <div className="glos-detail-lei">{termo.lei}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
