/* =============================================================================
 * CAMADA COMPARTILHADA DE GRÁFICOS — Relatório Emagrecimento GLP-1
 * Usada pelo deck (Relatorio Emagrecimento.dc.html) e pelo PDF
 * (Relatorio Emagrecimento-print.dc.html) para evitar duplicação de config.
 *  - baseOpts(o, ctx): opções (escalas/legenda/tooltip) de um gráfico.
 *  - stackConfig(o, ctx): config completo de um gráfico de barras empilhadas.
 * ctx carrega o estado que varia por consumidor: { periodos, unit, rotulos,
 * eixoY, animation }. Depende de window.CALC (cores e formatação).
 * =========================================================================== */
(function () {
  const LIGHT = ['#A9D0EE', '#C6D9E6', '#3E9BD6', '#00BFDF', '#8FB4CE', '#7FB2D9', '#5AA0CF'];
  const light = (c) => LIGHT.includes(c);

  function baseOpts(o, ctx) {
    o = o || {}; ctx = ctx || {};
    const C = window.CALC;
    const { stacked, dualAxis, percent, compact, unit, barMax, shareMin, shareMax } = o;
    const rot = !!ctx.rotulos, eixoY = !!ctx.eixoY;
    const opt = {
      responsive: true, maintainAspectRatio: false,
      animation: ctx.animation === undefined ? true : ctx.animation,
      interaction: { mode: 'index', intersect: false },
      layout: { padding: { top: rot ? 18 : 4, right: rot ? 10 : 2, bottom: compact ? 6 : 10 } },
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 12, boxHeight: 12, padding: 16, font: { size: 13 } } },
        tooltip: ctx.tooltip === false ? { enabled: false } : {
          callbacks: {
            label: (x) => {
              const v = x.parsed.y;
              if (percent || x.dataset.yAxisID === 'y1') return x.dataset.label + ': ' + C.fmtNum(v, 1) + '%';
              return x.dataset.label + ': ' + C.fmtNum(v, unit === 'R$ MM' ? 1 : 0);
            }
          }
        }
      },
      scales: {
        x: { stacked: !!stacked, grid: { display: false }, ticks: { font: { size: compact ? 11 : 12 }, maxRotation: 0, autoSkip: true, maxTicksLimit: ctx.maxTicks || (compact ? 7 : 13) } },
        y: { stacked: !!stacked, display: eixoY, grid: { display: eixoY, color: '#EFEFEF' }, ticks: { font: { size: compact ? 11 : 12 }, callback: (v) => percent ? v + '%' : C.fmtNum(v, 0) }, beginAtZero: true }
      }
    };
    if (percent) { opt.scales.y.max = 100; opt.scales.y.stacked = true; }
    if (dualAxis) {
      if (shareMax != null) {
        const sMin = shareMin != null ? shareMin : 0, sMax = shareMax;
        const span = (sMax - sMin) || Math.max(sMax, 1);
        const range = span / 0.28;
        const y1min = sMin - 0.66 * range;
        opt.scales.y1 = { display: eixoY, position: 'right', min: y1min, max: y1min + range, grid: { display: false }, ticks: { callback: (v) => v + '%', font: { size: 12 } } };
        if (barMax != null) opt.scales.y.max = barMax / 0.58;
      } else {
        opt.scales.y1 = { display: eixoY, position: 'right', grid: { display: false }, ticks: { callback: (v) => v + '%', font: { size: 12 } } };
      }
    }
    return opt;
  }

  function stackConfig(o, ctx) {
    o = o || {}; ctx = ctx || {};
    const C = window.CALC;
    const { dataObj, order, percent } = o;
    const barR = o.barR || 0, rot = !!ctx.rotulos;
    const noLbl = o.noLabelKeys || [];
    const keys = order.filter(k => dataObj[k]);
    const lastIdx = keys.length - 1;
    const ds = keys.map((k, idx) => {
      const col = C.cor(k);
      const seg = (rot && noLbl.indexOf(k) < 0)
        ? { display: (c) => { const n = c.chart.data.labels.length; return (c.dataIndex === 0 || c.dataIndex === n - 1) && c.dataset.data[c.dataIndex] >= (percent ? 6 : 0.01); }, color: light(col) ? '#074878' : '#fff', font: { size: 12, weight: '700' }, formatter: (v) => percent ? C.fmtNum(v, 0) + '%' : C.fmtNum(v, 0) }
        : { display: false };
      let datalabels = seg;
      if (idx === lastIdx && o.totalLabel && o.totals) {
        datalabels = { labels: { value: seg, total: { display: (c) => { const n = c.chart.data.labels.length; return c.dataIndex === 0 || c.dataIndex === n - 1; }, anchor: 'end', align: 'end', offset: 4, color: '#292A2B', font: { size: 12, weight: '700' }, formatter: (v, c) => C.fmtNum(o.totals[c.dataIndex], 0) } } };
      }
      return { label: k, data: dataObj[k], backgroundColor: col, stack: 's', borderWidth: 0, borderRadius: barR, datalabels };
    });
    return { type: 'bar', data: { labels: ctx.periodos, datasets: ds }, options: baseOpts({ stacked: true, percent, compact: true, unit: ctx.unit }, ctx) };
  }

  function comboConfig(o, ctx) {
    o = o || {}; ctx = ctx || {};
    const C = window.CALC; const rot = !!ctx.rotulos;
    const totals = o.totals || [], order = o.order || [];
    const brandDs = order.map((k, i) => {
      const d = { type: 'bar', label: k, data: o.barsObj[k], backgroundColor: C.cor(k), stack: 'g', borderRadius: o.barR || 0, order: 3, datalabels: { display: false } };
      if (rot && o.segLabel && i === 0) d.datalabels = { display: (c) => c.dataset.data[c.dataIndex] > 0, anchor: 'center', align: 'center', color: '#fff', font: { size: 12, weight: '700' }, formatter: (v) => C.fmtNum(v, 0) };
      return d;
    });
    if (brandDs.length) brandDs[brandDs.length - 1].datalabels = (rot || o.alwaysTotal)
      ? { display: (c) => { const n = c.chart.data.labels.length; return c.dataIndex === 0 || c.dataIndex === n - 1; }, anchor: 'end', align: 'end', offset: 2, color: '#292A2B', font: { size: 12, weight: '700' }, formatter: (v, c) => C.fmtNum(totals[c.dataIndex], 0) }
      : { display: false };
    const datasets = [...brandDs];
    const optsIn = { stacked: true, unit: o.unit };
    if (o.lineData != null) {
      const lineKey = o.lineColorKey || 'Share no mercado (%)';
      const lineFmt = o.lineFmt || ((v) => C.fmtNum(v, 1) + '%');
      datasets.push({ type: 'line', label: o.lineLabel, data: o.lineData, borderColor: C.cor(lineKey), backgroundColor: C.cor(lineKey), borderWidth: 3, tension: .3, yAxisID: 'y1', pointRadius: o.linePointRadius == null ? 3 : o.linePointRadius, order: 1, datalabels: rot ? { display: true, align: 'top', color: C.cor('Cresc. mercado (%)'), font: { size: 12, weight: '700' }, formatter: (v) => v == null ? '' : lineFmt(v) } : { display: false } });
      optsIn.dualAxis = true;
      if (o.band !== false) { optsIn.barMax = Math.max.apply(null, totals); optsIn.shareMin = Math.min.apply(null, o.lineData); optsIn.shareMax = Math.max.apply(null, o.lineData); }
    }
    return { data: { labels: ctx.periodos, datasets }, options: baseOpts(optsIn, ctx) };
  }

  window.HYReport = { baseOpts, stackConfig, comboConfig, light };
})();
