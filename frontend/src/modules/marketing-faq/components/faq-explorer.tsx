"use client";

import { useState } from "react";
import { faqCategories, questions } from "../data/questions";

function normalize(text: string) {
  return text.toLocaleLowerCase("tr-TR").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ı/g, "i");
}

export function FaqExplorer() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>(faqCategories[0]);
  const needle = normalize(query.trim());
  const results = questions.filter((item) => (category === faqCategories[0] || category === item.category) && normalize(`${item.question} ${item.answer}`).includes(needle));

  return <>
    <div className="faq-search">
      <span className="material-symbols-outlined" aria-hidden="true">search</span>
      <input type="search" aria-label="Sorularda ara" aria-controls="faq-results" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Örneğin: komisyon, dropshipping, kargo..." />
      {query && <button type="button" aria-label="Aramayı temizle" onClick={() => setQuery("")}><span className="material-symbols-outlined" aria-hidden="true">close</span></button>}
    </div>
    <section className="public-section" aria-label="Soru ve cevaplar">
      <div className="public-container">
        <div className="faq-controls" role="group" aria-label="Soru kategorileri">{faqCategories.map((item) => <button type="button" key={item} aria-pressed={category === item} aria-controls="faq-results" onClick={() => setCategory(item)}>{item}</button>)}</div>
        <div className="faq-results" id="faq-results">
          <p className="faq-result-count" role="status">{results.length} soru bulundu{category !== faqCategories[0] ? ` · ${category}` : ""}</p>
          {results.map((item) => <details key={item.id} className="faq-item" name="support-faq"><summary><span>{item.question}</span><span className="material-symbols-outlined" aria-hidden="true">expand_more</span></summary><p className="faq-answer">{item.answer}</p></details>)}
          {results.length === 0 && <div className="faq-empty"><span className="public-icon"><span className="material-symbols-outlined" aria-hidden="true">search_off</span></span><h2>Aradığınız soruyu bulamadık.</h2><p>Başka bir kelime deneyin veya tüm sorulara göz atın.</p><button type="button" className="public-button" onClick={() => { setQuery(""); setCategory(faqCategories[0]); }}>Tüm Soruları Göster</button></div>}
        </div>
      </div>
    </section>
  </>;
}
