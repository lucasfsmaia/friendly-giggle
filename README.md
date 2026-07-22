# Mercado de Emagrecimento GLP-1 — Relatório Hypera Pharma

Relatório mensal do mercado de emagrecimento (GLP-1), gerado a partir de uma
**base de dados única e atualizável** e publicado como site estático no GitHub Pages.

- **Relatório (deck):** `https://lucasfsmaia.github.io/friendly-giggle/`
- **PDF (versão completa):** botão “Baixar PDF” dentro do relatório (abre `relatorio-print.html`)
- **Atualizador da base:** `https://lucasfsmaia.github.io/friendly-giggle/atualizador.html`

---

## Como o build funciona (GitHub Actions)

As páginas são **Design Components** (`*.dc.html`) que abrem direto no navegador.
Não há empacotamento/inlining: o site é servido com os arquivos-fonte + suas
dependências. O workflow `.github/workflows/deploy.yml`, a cada push na `main`:

1. **Build:** copia as fontes para os nomes publicados
   - `Relatorio Emagrecimento.dc.html` → `index.html`
   - `Relatorio Emagrecimento-print.dc.html` → `relatorio-print.html`
   - `Atualizador da Base.dc.html` → `atualizador.html`
2. **Deploy:** publica a raiz do repositório no GitHub Pages.

Configuração única: **Settings → Pages → Build and deployment → Source → “GitHub Actions”**.

> Não faça commit de `index.html` / `relatorio-print.html` / `atualizador.html`:
> eles são **gerados pelo Actions** a partir das fontes.

---

## Estrutura do repositório (o que fazer commit)

Tudo fica na **raiz** — o relatório carrega `base-emagrecimento.js` e as
dependências por caminho relativo; não use subpastas para esses arquivos.

```
/
├── Relatorio Emagrecimento.dc.html        # Fonte do relatório (deck)  → index.html
├── Relatorio Emagrecimento-print.dc.html  # Fonte do PDF               → relatorio-print.html
├── Atualizador da Base.dc.html            # Fonte do atualizador       → atualizador.html
├── base-emagrecimento.js                  # DADOS — único arquivo trocado a cada semana
├── calc.js                                # Motor de cálculo (compartilhado)
├── report-charts.js                       # Camada de gráficos (compartilhada deck + PDF)
├── deck-stage.js                          # Componente de apresentação
├── support.js                             # Runtime das Design Components
├── Modelo Base -Excel-.xlsx               # Modelo Excel (abas Dados/Preco, com coluna CPP)
├── _ds/                                   # Design system Hypera (tokens, bundle)
├── assets/                                # Imagens (capa, logos)
├── .nojekyll                              # Desliga o Jekyll no Pages
└── .github/workflows/deploy.yml           # Build + deploy no push
```

Gerados pelo Actions (não commitar): `index.html`, `relatorio-print.html`, `atualizador.html`.

---

## Métricas e dimensões

- **Métricas:** PPP (R$ MM), Unidades (Mil) e **CPP (R$ MM)** — a coluna CPP é
  opcional; quando presente na base, a métrica aparece sozinha no relatório.
- **Visões:** One Page (mercado, corporação, canal), Demanda (molécula, marca,
  corporação, dosagem, canal, crescimento) e Preço.

---

## Atualização semanal (qualquer colaborador)

1. Abra `…/atualizador.html`.
2. **Baixar modelo (Excel)** e preencha as abas **Dados** e **Preco**
   (coluna **CPP** opcional; ordem das colunas livre — reconhecidas pelo cabeçalho).
3. Solte o Excel → **Validar e gerar base** → **Baixar** (`base-emagrecimento.js`).
4. No GitHub: **Add file → Upload files** → suba o `base-emagrecimento.js` (sobrescreve) → **Commit** na `main`.
5. O commit dispara o Actions; em ~1 min o relatório e o PDF já mostram os dados novos.

> Acesso a mais pessoas: **Settings → Collaborators**.

---

## Editar o layout

O desenho vive nas fontes `*.dc.html` (e nos módulos `calc.js` / `report-charts.js`).
Depois de alterar, faça commit das fontes na `main` — o Actions republica sozinho.
