import { useState, useMemo } from 'react';

// ─── formatters ────────────────────────────────────────────────────
const brl = (v, dec = 0) =>
  Number(v || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: dec,
    maximumFractionDigits: dec,
  });
const pct = (v, dec = 1) => `${Number(v || 0).toFixed(dec)}%`;
const short = (v) => {
  const n = Number(v || 0),
    a = Math.abs(n),
    s = n < 0 ? '-' : '';
  if (a >= 1_000_000) return `${s}R$ ${(a / 1_000_000).toFixed(2)}M`;
  if (a >= 1_000) return `${s}R$ ${(a / 1_000).toFixed(0)}K`;
  return brl(n);
};

// ─── palette ───────────────────────────────────────────────────────
const C = {
  bg: '#0b0b08',
  card: '#111108',
  line: '#1e1e14',
  gold: '#c8a84b',
  green: '#4e9e6e',
  red: '#c05050',
  blue: '#4a7ec8',
  muted: '#55524a',
  text: '#ddd8cc',
  dim: '#6a6555',
};

// ─── Slider ────────────────────────────────────────────────────────
function Slider({ label, value, min, max, step, fmt, onChange, color }: any) {
  const p = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ marginBottom: 18 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 6,
          gap: 10,
        }}
      >
        <span style={{ fontSize: 11, color: C.dim, letterSpacing: '0.3px' }}>
          {label}
        </span>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: color || C.gold,
            fontFamily: 'monospace',
            whiteSpace: 'nowrap',
          }}
        >
          {fmt(value)}
        </span>
      </div>
      <div
        style={{
          position: 'relative',
          height: 3,
          background: '#252518',
          borderRadius: 99,
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            width: `${p}%`,
            height: '100%',
            background: color || C.gold,
            borderRadius: 99,
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(+e.target.value)}
          style={{
            position: 'absolute',
            width: '100%',
            height: 22,
            opacity: 0,
            cursor: 'pointer',
            top: -10,
            left: 0,
            margin: 0,
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 13,
            height: 13,
            background: color || C.gold,
            borderRadius: '50%',
            top: '50%',
            left: `${p}%`,
            transform: 'translate(-50%,-50%)',
            boxShadow: `0 0 8px ${color || C.gold}88`,
            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  );
}

// ─── SVG line chart ────────────────────────────────────────────────
function LineChart({ data, activeYear, onHover }: any) {
  const W = 900,
    H = 260,
    px = 52,
    pt = 16,
    pb = 30;
  const iW = W - px * 2,
    iH = H - pt - pb;
  const maxY = Math.max(...data.map((d) => Math.max(d.imovel, d.cdi)), 1);
  const xOf = (i) => px + (i / Math.max(data.length - 1, 1)) * iW;
  const yOf = (v) => pt + iH - (Math.max(v, 0) / maxY) * iH;
  const pathOf = (key) =>
    data
      .map(
        (d, i) =>
          `${i === 0 ? 'M' : 'L'} ${xOf(i).toFixed(1)} ${yOf(d[key]).toFixed(
            1
          )}`
      )
      .join(' ');

  const gridVals = [0, 0.25, 0.5, 0.75, 1].map((f) => maxY * f);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: '100%', height: 'auto', display: 'block' }}
      onMouseLeave={() => onHover(null)}
    >
      {/* grid */}
      {gridVals.map((v, i) => (
        <g key={i}>
          <line
            x1={px}
            x2={W - px}
            y1={yOf(v)}
            y2={yOf(v)}
            stroke={C.line}
            strokeWidth="1"
          />
          <text
            x={px - 4}
            y={yOf(v) + 4}
            fontSize="9"
            fill={C.muted}
            textAnchor="end"
          >
            {short(v)}
          </text>
        </g>
      ))}
      {/* x labels */}
      {data
        .filter((_, i) => i === 0 || (i + 1) % 5 === 0 || i === data.length - 1)
        .map((d, _, arr) => (
          <text
            key={d.ano}
            x={xOf(data.indexOf(d))}
            y={H - 6}
            textAnchor="middle"
            fontSize="9"
            fill={C.muted}
          >
            {d.ano}a
          </text>
        ))}
      {/* area fills */}
      <defs>
        <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.green} stopOpacity="0.18" />
          <stop offset="100%" stopColor={C.green} stopOpacity="0" />
        </linearGradient>
        <linearGradient id="gB" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.blue} stopOpacity="0.14" />
          <stop offset="100%" stopColor={C.blue} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`${pathOf('imovel')} L ${xOf(data.length - 1)} ${pt + iH} L ${px} ${
          pt + iH
        } Z`}
        fill="url(#gA)"
      />
      <path
        d={`${pathOf('cdi')} L ${xOf(data.length - 1)} ${pt + iH} L ${px} ${
          pt + iH
        } Z`}
        fill="url(#gB)"
      />
      {/* lines */}
      <path
        d={pathOf('imovel')}
        fill="none"
        stroke={C.green}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={pathOf('cdi')}
        fill="none"
        stroke={C.blue}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* hover regions */}
      {data.map((d, i) => (
        <rect
          key={i}
          x={xOf(i) - iW / data.length / 2}
          y={pt}
          width={iW / data.length}
          height={iH + pb}
          fill="transparent"
          style={{ cursor: 'pointer' }}
          onMouseEnter={() => onHover(d.ano)}
        />
      ))}
      {/* active marker */}
      {activeYear &&
        (() => {
          const d = data[activeYear - 1];
          if (!d) return null;
          const xi = xOf(activeYear - 1);
          return (
            <g>
              <line
                x1={xi}
                x2={xi}
                y1={pt}
                y2={pt + iH}
                stroke={C.gold}
                strokeWidth="1"
                strokeDasharray="4 3"
                opacity="0.6"
              />
              <circle
                cx={xi}
                cy={yOf(d.imovel)}
                r="5"
                fill={C.green}
                stroke={C.bg}
                strokeWidth="2"
              />
              <circle
                cx={xi}
                cy={yOf(d.cdi)}
                r="5"
                fill={C.blue}
                stroke={C.bg}
                strokeWidth="2"
              />
              <rect
                x={xi - 64}
                y={yOf(Math.max(d.imovel, d.cdi)) - 52}
                width={128}
                height={44}
                rx="6"
                fill="#111108"
                stroke={C.gold}
                strokeWidth="1"
                opacity="0.95"
              />
              <text
                x={xi}
                y={yOf(Math.max(d.imovel, d.cdi)) - 36}
                textAnchor="middle"
                fontSize="9"
                fill={C.gold}
              >
                Ano {d.ano}
              </text>
              <text
                x={xi - 4}
                y={yOf(Math.max(d.imovel, d.cdi)) - 22}
                textAnchor="end"
                fontSize="9"
                fill={C.green}
              >
                🏠 {short(d.imovel)}
              </text>
              <text
                x={xi + 4}
                y={yOf(Math.max(d.imovel, d.cdi)) - 22}
                textAnchor="start"
                fontSize="9"
                fill={C.blue}
              >
                💰 {short(d.cdi)}
              </text>
            </g>
          );
        })()}
    </svg>
  );
}

// ─── KPI card ──────────────────────────────────────────────────────
function KPI({ label, value, color, sub, highlight }: any) {
  return (
    <div
      style={{
        background: highlight ? '#151510' : '#0d0d0a',
        border: `1px solid ${highlight ? C.gold + '44' : C.line}`,
        borderRadius: 10,
        padding: '12px 14px',
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: '#4a4840',
          marginBottom: 4,
          lineHeight: 1.4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: color || C.text,
          fontFamily: 'monospace',
        }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 10, color: '#333328', marginTop: 3 }}>
          {sub}
        </div>
      )}
    </div>
  );
}

// ─── Row detail ────────────────────────────────────────────────────
function Row({ label, value, color, border = true, indent }: any) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        padding: '8px 0',
        borderBottom: border ? `1px solid ${C.line}` : 'none',
      }}
    >
      <span
        style={{ fontSize: 12, color: C.dim, paddingLeft: indent ? 14 : 0 }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: color || C.text,
          fontFamily: 'monospace',
        }}
      >
        {value}
      </span>
    </div>
  );
}

// ─── main ──────────────────────────────────────────────────────────
export default function App() {
  const [preco, setPreco] = useState(1_400_000);
  const [entradaPct, setEntradaPct] = useState(20);
  const [taxaAA, setTaxaAA] = useState(10);
  const [prazoAnos, setPrazoAnos] = useState(20);
  const [valorizAA, setValorizAA] = useState(8);
  const [cdiPct, setCdiPct] = useState(110);
  const [condoMes, setCondoMes] = useState(1500);
  const [manutPct, setManutPct] = useState(0.5);
  const [aluguelMes, setAluguelMes] = useState(7000);
  const [showAdv, setShowAdv] = useState(false);
  const [tab, setTab] = useState('decisao');
  const [anoViz, setAnoViz] = useState(10);
  const [hoverAno, setHoverAno] = useState(null);

  const CDI_AA = 13.25;

  // ── cálculo imóvel ───────────────────────────────────────────────
  const calc = useMemo(() => {
    const entrada = (preco * entradaPct) / 100;
    const financiado = preco - entrada;
    const itbi = preco * 0.03;
    const corretagem = preco * 0.06;
    const cartorio = preco * 0.015;
    const custosEnt = itbi + corretagem + cartorio;
    const capitalTotal = entrada + custosEnt;
    const taxaAM = Math.pow(1 + taxaAA / 100, 1 / 12) - 1;
    const prazoMes = prazoAnos * 12;
    const amort = financiado / prazoMes;
    const iptuAnual = preco * 0.007;
    const iptuMes = iptuAnual / 12;
    const manutMes = (preco * manutPct) / 100 / 12;

    const anos = [];
    let saldo = financiado,
      totalJurosAcum = 0,
      valorImovel = preco,
      custoAcumulado = capitalTotal;

    for (let ano = 1; ano <= prazoAnos; ano++) {
      let juroAno = 0,
        parcelaAno = 0;
      const parcelaMes1 = amort + saldo * taxaAM;
      for (let m = 0; m < 12; m++) {
        const j = saldo * taxaAM;
        juroAno += j;
        parcelaAno += amort + j;
        saldo = Math.max(saldo - amort, 0);
      }
      totalJurosAcum += juroAno;
      valorImovel *= 1 + valorizAA / 100;
      const custoAnual = parcelaAno + iptuAnual + condoMes * 12 + manutMes * 12;
      custoAcumulado += custoAnual;
      // aluguel anual e saldo (aluguel − parcela média do ano)
      const aluguelAnual = aluguelMes * 12;
      const parcelaMediaAno = parcelaAno / 12;
      const saldoAluguel = aluguelMes - parcelaMediaAno; // mensal: positivo = cobre parcela
      anos.push({
        ano,
        parcelaMes1,
        saldoDev: Math.max(saldo, 0),
        juroAno,
        parcelaAno,
        parcelaMediaAno,
        totalJurosAcum,
        valorImovel,
        equity: valorImovel - Math.max(saldo, 0),
        equityLiq:
          valorImovel -
          Math.max(saldo, 0) -
          Math.max(valorImovel - preco, 0) * 0.15,
        custoAnual,
        custoAcumulado,
        iptuAnual,
        condoAnual: condoMes * 12,
        manutAnual: manutMes * 12,
        amortAnual: amort * 12,
        aluguelAnual,
        saldoAluguel,
      });
    }

    const totalJuros = anos.reduce((s, a) => s + a.juroAno, 0);
    const totalCondo = condoMes * 12 * prazoAnos;
    const totalIptu = iptuAnual * prazoAnos;
    const totalManut = manutMes * 12 * prazoAnos;
    const custoTotalVida =
      custosEnt + financiado + totalJuros + totalCondo + totalIptu + totalManut;
    const valorFinal = anos[prazoAnos - 1]?.valorImovel ?? preco;
    const ganhoLiqVenda = valorFinal - Math.max(valorFinal - preco, 0) * 0.15; // após IR GC

    return {
      entrada,
      financiado,
      itbi,
      corretagem,
      cartorio,
      custosEnt,
      capitalTotal,
      amort,
      iptuMes,
      iptuAnual,
      manutMes,
      taxaAM,
      prazoAnos,
      parcelaIni: anos[0]?.parcelaMes1 ?? 0,
      parcelaFim: anos[prazoAnos - 1]?.parcelaMes1 ?? 0,
      anos,
      totalJuros,
      totalCondo,
      totalIptu,
      totalManut,
      custoTotalVida,
      valorFinal,
      ganhoLiqVenda,
    };
  }, [
    preco,
    entradaPct,
    taxaAA,
    prazoAnos,
    valorizAA,
    condoMes,
    manutPct,
    aluguelMes,
  ]);

  // ── cálculo CDI ──────────────────────────────────────────────────
  // Premissa: quem não compra o imóvel investe no CDI os mesmos
  // valores que gastaria com o imóvel, nos momentos exatos:
  //
  //   Dia 1        : entrada + ITBI + corretagem + cartório (capital inicial)
  //   Todo mês     : parcela SAC exata daquele mês
  //   Todo mês     : condomínio + manutenção
  //   Janeiro/ano  : IPTU anual (uma vez por ano, não diluído)
  //
  // IR: aplicado anualmente sobre os rendimentos do ano (alíquota
  // regressiva simplificada — 15% para prazo longo, como CDB > 2 anos).
  // O IR é deduzido do patrimônio a cada virada de ano, simulando
  // come-cotas ou resgates periódicos. Isso evita o erro de acumular
  // juros sobre IR ainda não pago.
  const cdiCalc = useMemo(() => {
    const taxaCDI_AA = (CDI_AA * cdiPct) / 100;
    const taxaCDI_AM = Math.pow(1 + taxaCDI_AA / 100, 1 / 12) - 1;

    // SAC mês a mês
    const financiado = preco * (1 - entradaPct / 100);
    const taxaAM = Math.pow(1 + taxaAA / 100, 1 / 12) - 1;
    const prazoMes = prazoAnos * 12;
    const amort = financiado / prazoMes;
    const iptuAnual = preco * 0.007;
    const manutMes = (preco * manutPct) / 100 / 12;

    const parcelasSAC = [];
    let saldo = financiado;
    for (let m = 0; m < prazoMes; m++) {
      parcelasSAC.push(amort + saldo * taxaAM);
      saldo = Math.max(saldo - amort, 0);
    }

    // Patrimônio líquido: acompanhamos separadamente o principal
    // (aportes) e os rendimentos, para calcular IR só sobre rendimentos.
    let principal = calc.capitalTotal; // total aportado até agora
    let rendimentos = 0; // rendimentos brutos acumulados (ainda não tributados)
    let patrimonioLiq = calc.capitalTotal; // patrimônio já líquido de IR pago
    const anosCDI = [];

    for (let ano = 1; ano <= prazoAnos; ano++) {
      let aporteAnoTotal = 0;

      for (let m = 0; m < 12; m++) {
        const mesGlobal = (ano - 1) * 12 + m;
        const parcela = parcelasSAC[mesGlobal] ?? 0;
        const iptoMes = m === 0 ? iptuAnual : 0;
        const aporteMes = parcela + condoMes + manutMes + iptoMes;

        // Rendimento sobre patrimônio líquido atual
        const rend = patrimonioLiq * taxaCDI_AM;
        rendimentos += rend;
        patrimonioLiq += rend + aporteMes;
        principal += aporteMes;
        aporteAnoTotal += aporteMes;
      }

      // IR anual sobre rendimentos do ano (15% longo prazo)
      // Deduz do patrimônio, simulando tributação periódica
      const irAno = rendimentos * 0.15;
      patrimonioLiq -= irAno;
      rendimentos = 0; // zera para o próximo ano

      // Renda mensal líquida = rendimento mensal sem tocar no principal
      const rendaMensalBruta = patrimonioLiq * taxaCDI_AM;
      const rendaMensalLiq = rendaMensalBruta * 0.85;

      anosCDI.push({
        ano,
        patrimonioBruto: patrimonioLiq + irAno, // bruto = antes do IR deste ano
        patrimonioLiq,
        rendaMensalLiq,
        aportesAcum: principal,
        aporte: aporteAnoTotal / 12,
        ir: irAno,
      });
    }

    return { anosCDI, taxaCDI_AA };
  }, [calc, cdiPct, prazoAnos, preco, entradaPct, taxaAA, condoMes, manutPct]);

  // ── dados para gráfico ───────────────────────────────────────────
  const comparativo = useMemo(
    () =>
      Array.from({ length: prazoAnos }, (_, i) => ({
        ano: i + 1,
        imovel: calc.anos[i]?.equityLiq ?? 0,
        cdi: cdiCalc.anosCDI[i]?.patrimonioLiq ?? 0,
      })),
    [calc, cdiCalc, prazoAnos]
  );

  const anoVirada = comparativo.find((d) => d.imovel > d.cdi)?.ano ?? null;
  const finalImovel = calc.ganhoLiqVenda;
  const finalCDI = cdiCalc.anosCDI[prazoAnos - 1]?.patrimonioLiq ?? 0;
  const diff = finalCDI - finalImovel;

  const ano = Math.min(anoViz, prazoAnos);
  const aImo = calc.anos[ano - 1];
  const aCDI = cdiCalc.anosCDI[ano - 1];

  // ── style helpers ────────────────────────────────────────────────
  const card = (extra = {}) => ({
    background: C.card,
    border: `1px solid ${C.line}`,
    borderRadius: 12,
    padding: '16px 18px',
    ...extra,
  });
  const tabBtn = (k) => ({
    flex: 1,
    padding: '9px 6px',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    fontSize: 12,
    fontFamily: 'inherit',
    transition: 'all .2s',
    background: tab === k ? C.gold : 'transparent',
    color: tab === k ? C.bg : C.muted,
    fontWeight: tab === k ? 700 : 400,
  });

  return (
    <div
      style={{
        minHeight: '100vh',
        background: C.bg,
        color: C.text,
        fontFamily: "'Georgia', 'Times New Roman', serif",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          background: 'linear-gradient(160deg,#1a180e,#0e0c06)',
          borderBottom: `1px solid ${C.line}`,
          padding: '24px 20px 18px',
        }}
      >
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div
            style={{
              fontSize: 9,
              letterSpacing: '4px',
              color: C.gold,
              textTransform: 'uppercase',
              marginBottom: 5,
            }}
          >
            Simulador · Vila Nova Conceição · São Paulo
          </div>
          <h1
            style={{
              fontSize: 'clamp(18px,4vw,30px)',
              fontWeight: 'normal',
              margin: '0 0 3px',
              color: '#ede8da',
            }}
          >
            Imóvel vs CDI com Liquidez Diária
          </h1>
          <p style={{ fontSize: 11, color: '#4a4838', margin: 0 }}>
            Todos os parâmetros são ajustáveis — valores em reais correntes.
          </p>
        </div>
      </div>

      <div
        style={{ maxWidth: 960, margin: '0 auto', padding: '18px 14px 36px' }}
      >
        {/* SLIDERS */}
        <div
          style={{ ...card({ marginBottom: 16, borderColor: `${C.gold}33` }) }}
        >
          <div
            style={{
              fontSize: 9,
              letterSpacing: '3px',
              color: C.gold,
              textTransform: 'uppercase',
              marginBottom: 14,
            }}
          >
            Premissas
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))',
              gap: '0 32px',
            }}
          >
            <Slider
              label="Valor do imóvel"
              value={preco}
              min={500_000}
              max={5_000_000}
              step={50_000}
              fmt={(v) => short(v)}
              onChange={setPreco}
              color={C.gold}
            />
            <Slider
              label="Entrada"
              value={entradaPct}
              min={10}
              max={80}
              step={5}
              fmt={(v) => `${v}% → ${short((preco * v) / 100)}`}
              onChange={setEntradaPct}
              color={C.gold}
            />
            <Slider
              label="Taxa do financiamento"
              value={taxaAA}
              min={7}
              max={16}
              step={0.25}
              fmt={(v) => pct(v)}
              onChange={setTaxaAA}
              color={C.red}
            />
            <Slider
              label="Valorização anual estimada"
              value={valorizAA}
              min={3}
              max={15}
              step={0.5}
              fmt={(v) => pct(v)}
              onChange={setValorizAA}
              color={C.green}
            />
          </div>
          <button
            onClick={() => setShowAdv((v) => !v)}
            style={{
              background: 'none',
              border: 'none',
              color: C.gold,
              cursor: 'pointer',
              fontSize: 11,
              padding: '4px 0',
              marginTop: 2,
            }}
          >
            {showAdv ? '▲ Ocultar avançados' : '▼ Mostrar parâmetros avançados'}
          </button>
          {showAdv && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))',
                gap: '0 32px',
                marginTop: 12,
                paddingTop: 12,
                borderTop: `1px solid ${C.line}`,
              }}
            >
              <Slider
                label="Prazo do financiamento"
                value={prazoAnos}
                min={5}
                max={35}
                step={5}
                fmt={(v) => `${v} anos`}
                onChange={(v) => {
                  setPrazoAnos(v);
                  setAnoViz((a) => Math.min(a, v));
                }}
                color={C.gold}
              />
              <Slider
                label="Condomínio mensal"
                value={condoMes}
                min={500}
                max={5000}
                step={100}
                fmt={(v) => brl(v)}
                onChange={setCondoMes}
                color={C.gold}
              />
              <Slider
                label="Manutenção anual (% valor)"
                value={manutPct}
                min={0.2}
                max={2}
                step={0.1}
                fmt={(v) => pct(v)}
                onChange={setManutPct}
                color={C.gold}
              />
              <Slider
                label="Rendimento CDI"
                value={cdiPct}
                min={90}
                max={130}
                step={1}
                fmt={(v) => `${v}% CDI → ${pct((CDI_AA * v) / 100)} a.a.`}
                onChange={setCdiPct}
                color={C.blue}
              />
            </div>
          )}
        </div>

        {/* TABS */}
        <div
          style={{
            display: 'flex',
            gap: 3,
            marginBottom: 16,
            background: '#080806',
            borderRadius: 10,
            padding: 3,
            border: `1px solid ${C.line}`,
          }}
        >
          {[
            ['decisao', '⚖️ Decisão'],
            ['custos', '🏠 Custos do Imóvel'],
            ['cdi', '💰 CDI'],
          ].map(([k, v]) => (
            <button key={k} onClick={() => setTab(k)} style={tabBtn(k)}>
              {v}
            </button>
          ))}
        </div>

        {/* ══════════════ TAB DECISÃO ══════════════ */}
        {tab === 'decisao' && (
          <div>
            {/* Resumo executivo */}
            <div
              style={{
                ...card({
                  marginBottom: 14,
                  background: '#0c0c09',
                  borderColor: `${C.gold}33`,
                }),
              }}
            >
              <div
                style={{
                  fontSize: 9,
                  letterSpacing: '3px',
                  color: C.gold,
                  textTransform: 'uppercase',
                  marginBottom: 12,
                }}
              >
                Resumo Executivo — {prazoAnos} anos
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 12,
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    background: '#0a100c',
                    border: `1px solid ${C.green}33`,
                    borderRadius: 10,
                    padding: '14px 16px',
                  }}
                >
                  <div
                    style={{ fontSize: 10, color: C.green, marginBottom: 4 }}
                  >
                    🏠 Imóvel (equity líq. após IR GC)
                  </div>
                  <div
                    style={{
                      fontSize: 26,
                      fontWeight: 700,
                      color: C.green,
                      fontFamily: 'monospace',
                    }}
                  >
                    {short(finalImovel)}
                  </div>
                </div>
                <div
                  style={{
                    background: '#08080f',
                    border: `1px solid ${C.blue}33`,
                    borderRadius: 10,
                    padding: '14px 16px',
                  }}
                >
                  <div style={{ fontSize: 10, color: C.blue, marginBottom: 4 }}>
                    💰 CDI {cdiPct}% (líq. após IR)
                  </div>
                  <div
                    style={{
                      fontSize: 26,
                      fontWeight: 700,
                      color: C.blue,
                      fontFamily: 'monospace',
                    }}
                  >
                    {short(finalCDI)}
                  </div>
                </div>
              </div>
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: 10,
                  background: diff > 0 ? '#08080f' : '#0b0e09',
                  border: `1px solid ${diff > 0 ? C.blue : C.green}33`,
                }}
              >
                <div style={{ fontSize: 14, color: C.text, lineHeight: 1.6 }}>
                  {diff > 0 ? (
                    <>
                      <strong style={{ color: C.blue }}>
                        CDI está à frente
                      </strong>{' '}
                      por{' '}
                      <strong style={{ fontFamily: 'monospace' }}>
                        {short(diff)}
                      </strong>{' '}
                      neste cenário.
                    </>
                  ) : (
                    <>
                      <strong style={{ color: C.green }}>
                        Imóvel está à frente
                      </strong>{' '}
                      por{' '}
                      <strong style={{ fontFamily: 'monospace' }}>
                        {short(-diff)}
                      </strong>{' '}
                      neste cenário.
                    </>
                  )}
                </div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
                  {anoVirada
                    ? `O imóvel ultrapassa o CDI por volta do ano ${anoVirada}.`
                    : `O CDI permanece à frente em todo o horizonte de ${prazoAnos} anos.`}{' '}
                  Ambos já descontados de IR.
                </div>
              </div>
            </div>

            {/* Gráfico */}
            <div style={{ ...card({ marginBottom: 14 }) }}>
              <div
                style={{
                  fontSize: 9,
                  letterSpacing: '3px',
                  color: C.gold,
                  textTransform: 'uppercase',
                  marginBottom: 10,
                }}
              >
                Evolução Patrimonial — passe o mouse para ver o ano
              </div>
              <LineChart
                data={comparativo}
                activeYear={hoverAno || anoViz}
                onHover={setHoverAno}
              />
              <div
                style={{
                  display: 'flex',
                  gap: 16,
                  marginTop: 8,
                  fontSize: 11,
                  color: C.muted,
                }}
              >
                <span>
                  <span
                    style={{
                      display: 'inline-block',
                      width: 10,
                      height: 10,
                      background: C.green,
                      borderRadius: '50%',
                      marginRight: 5,
                    }}
                  />
                  Equity imóvel (líq. IR GC)
                </span>
                <span>
                  <span
                    style={{
                      display: 'inline-block',
                      width: 10,
                      height: 10,
                      background: C.blue,
                      borderRadius: '50%',
                      marginRight: 5,
                    }}
                  />
                  Patrimônio CDI (líq. IR)
                </span>
              </div>
            </div>

            {/* Seletor de ano */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: C.muted, marginBottom: 7 }}>
                Inspecionar ano:
              </div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {[1, 5, 10, Math.round(prazoAnos / 2), prazoAnos]
                  .filter((v, i, a) => a.indexOf(v) === i)
                  .map((a) => (
                    <button
                      key={a}
                      onClick={() => setAnoViz(a)}
                      style={{
                        padding: '5px 13px',
                        borderRadius: 20,
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 11,
                        fontFamily: 'inherit',
                        background: anoViz === a ? C.gold : '#111108',
                        color: anoViz === a ? C.bg : C.muted,
                        fontWeight: anoViz === a ? 700 : 400,
                      }}
                    >
                      {a === prazoAnos ? 'Final' : `${a}a`}
                    </button>
                  ))}
              </div>
            </div>

            {/* Cards ano selecionado */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))',
                gap: 8,
                marginBottom: 14,
              }}
            >
              <KPI
                label="Capital inicial (entrada + custos)"
                value={short(calc.capitalTotal)}
                color={C.red}
                sub="desembolso no dia 1"
              />
              <KPI
                label="1ª parcela SAC"
                value={brl(calc.parcelaIni)}
                color={C.red}
                sub="pressão de caixa inicial"
              />
              <KPI
                label={`Equity imóvel — ano ${ano}`}
                value={short(aImo?.equityLiq ?? 0)}
                color={C.green}
                sub="já com IR ganho capital"
              />
              <KPI
                label={`CDI líquido — ano ${ano}`}
                value={short(aCDI?.patrimonioLiq ?? 0)}
                color={C.blue}
                sub="já com IR 15%"
              />
              <KPI
                label={`Renda mensal CDI — ano ${ano}`}
                value={brl(aCDI?.rendaMensalLiq ?? 0)}
                color={C.green}
                sub="sem tocar no principal"
                highlight
              />
            </div>

            {/* Comparação lado a lado */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))',
                gap: 10,
              }}
            >
              <div style={card()}>
                <div
                  style={{
                    fontSize: 9,
                    letterSpacing: '3px',
                    color: C.green,
                    textTransform: 'uppercase',
                    marginBottom: 10,
                  }}
                >
                  🏠 Imóvel — ano {ano}
                </div>
                <Row
                  label="Valor de mercado"
                  value={short(aImo?.valorImovel ?? 0)}
                  color={C.green}
                />
                <Row
                  label="Saldo devedor"
                  value={short(aImo?.saldoDev ?? 0)}
                  color={C.red}
                />
                <Row
                  label="Equity bruto"
                  value={short(aImo?.equity ?? 0)}
                  color={C.green}
                />
                <Row
                  label="IR ganho capital (15%)"
                  value={
                    '−' +
                    short(Math.max((aImo?.valorImovel ?? 0) - preco, 0) * 0.15)
                  }
                  color={C.red}
                />
                <Row
                  label="Equity líquido"
                  value={short(aImo?.equityLiq ?? 0)}
                  color={C.green}
                  border={false}
                />
              </div>
              <div style={card()}>
                <div
                  style={{
                    fontSize: 9,
                    letterSpacing: '3px',
                    color: C.blue,
                    textTransform: 'uppercase',
                    marginBottom: 10,
                  }}
                >
                  💰 CDI — ano {ano}
                </div>
                <Row
                  label="Patrimônio bruto"
                  value={short(aCDI?.patrimonioBruto ?? 0)}
                  color={C.blue}
                />
                <Row
                  label="IR estimado (15%)"
                  value={'−' + short(aCDI?.ir ?? 0)}
                  color={C.red}
                />
                <Row
                  label="Patrimônio líquido"
                  value={short(aCDI?.patrimonioLiq ?? 0)}
                  color={C.blue}
                />
                <Row
                  label="Total aportado"
                  value={short(aCDI?.aportesAcum ?? 0)}
                  color={C.muted}
                />
                <Row
                  label="Renda mensal líquida"
                  value={brl(aCDI?.rendaMensalLiq ?? 0)}
                  color={C.green}
                  border={false}
                />
              </div>
            </div>
          </div>
        )}

        {/* ══════════════ TAB CUSTOS ══════════════ */}
        {tab === 'custos' && (
          <div>
            {/* Aquisição */}
            <div style={{ ...card({ marginBottom: 12 }) }}>
              <div
                style={{
                  fontSize: 9,
                  letterSpacing: '3px',
                  color: C.gold,
                  textTransform: 'uppercase',
                  marginBottom: 12,
                }}
              >
                Custos de Aquisição — Dia 1
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))',
                  gap: 8,
                  marginBottom: 10,
                }}
              >
                {[
                  [
                    'Entrada (' + entradaPct + '%)',
                    calc.entrada,
                    'pagamento direto ao vendedor',
                  ],
                  [
                    'ITBI — 3% (São Paulo)',
                    calc.itbi,
                    'imposto municipal obrigatório',
                  ],
                  ['Corretagem — 6%', calc.corretagem, 'comissão do corretor'],
                  ['Cartório — ~1,5%', calc.cartorio, 'escritura + registro'],
                ].map(([l, v, s]) => (
                  <div
                    key={l}
                    style={{
                      background: '#0d0d09',
                      border: `1px solid ${C.line}`,
                      borderRadius: 8,
                      padding: '12px 14px',
                    }}
                  >
                    <div
                      style={{ fontSize: 11, color: C.dim, marginBottom: 3 }}
                    >
                      {l}
                    </div>
                    <div
                      style={{
                        fontSize: 19,
                        fontWeight: 700,
                        color: C.red,
                        fontFamily: 'monospace',
                      }}
                    >
                      {short(v)}
                    </div>
                    <div style={{ fontSize: 10, color: '#2e2e24' }}>{s}</div>
                  </div>
                ))}
              </div>
              <div
                style={{
                  padding: '10px 14px',
                  background: '#0a0a07',
                  border: `1px solid ${C.line}`,
                  borderRadius: 8,
                  display: 'flex',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 6,
                }}
              >
                <span style={{ fontSize: 12, color: C.muted }}>
                  Total desembolsado no dia 1
                </span>
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: C.red,
                    fontFamily: 'monospace',
                  }}
                >
                  {short(calc.capitalTotal)}
                </span>
              </div>
            </div>

            {/* Mensais */}
            <div style={{ ...card({ marginBottom: 12 }) }}>
              <div
                style={{
                  fontSize: 9,
                  letterSpacing: '3px',
                  color: C.gold,
                  textTransform: 'uppercase',
                  marginBottom: 12,
                }}
              >
                Custos Mensais Recorrentes
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))',
                  gap: 8,
                  marginBottom: 10,
                }}
              >
                {[
                  [
                    'Parcela SAC — 1º mês',
                    calc.parcelaIni,
                    `${brl(calc.amort)} amort + ${brl(
                      calc.parcelaIni - calc.amort
                    )} juros`,
                  ],
                  ['Condomínio', condoMes, 'estimativa Horizonte JK'],
                  ['IPTU', calc.iptuMes, `${short(calc.iptuAnual)}/ano`],
                  [
                    'Manutenção',
                    calc.manutMes,
                    `${pct(manutPct)} a.a. do valor`,
                  ],
                ].map(([l, v, s]) => (
                  <div
                    key={l}
                    style={{
                      background: '#0d0d09',
                      border: `1px solid ${C.line}`,
                      borderRadius: 8,
                      padding: '12px 14px',
                    }}
                  >
                    <div
                      style={{ fontSize: 11, color: C.dim, marginBottom: 3 }}
                    >
                      {l}
                    </div>
                    <div
                      style={{
                        fontSize: 19,
                        fontWeight: 700,
                        color: C.red,
                        fontFamily: 'monospace',
                      }}
                    >
                      {brl(v)}
                    </div>
                    <div style={{ fontSize: 10, color: '#2e2e24' }}>{s}</div>
                  </div>
                ))}
              </div>
              <div
                style={{
                  padding: '10px 14px',
                  background: '#0a0a07',
                  border: `1px solid ${C.line}`,
                  borderRadius: 8,
                  display: 'flex',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 6,
                }}
              >
                <span style={{ fontSize: 12, color: C.muted }}>
                  Total mensal — ano 1
                </span>
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: C.red,
                    fontFamily: 'monospace',
                  }}
                >
                  {brl(
                    calc.parcelaIni + condoMes + calc.iptuMes + calc.manutMes
                  )}
                </span>
              </div>
            </div>

            {/* Tabela SAC anual com aluguel */}
            <div style={card()}>
              <div
                style={{
                  fontSize: 9,
                  letterSpacing: '3px',
                  color: C.gold,
                  textTransform: 'uppercase',
                  marginBottom: 14,
                }}
              >
                Tabela SAC Anual + Aluguel
              </div>

              {/* Slider aluguel */}
              <div
                style={{
                  marginBottom: 18,
                  padding: '12px 16px',
                  background: '#0a0a07',
                  borderRadius: 8,
                  border: `1px solid ${C.line}`,
                }}
              >
                <Slider
                  label="Aluguel mensal estimado"
                  value={aluguelMes}
                  min={1000}
                  max={20000}
                  step={500}
                  fmt={(v) =>
                    `${brl(v)}  →  yield ${pct(((v * 12) / preco) * 100)} a.a.`
                  }
                  onChange={setAluguelMes}
                  color={C.green}
                />
                {(() => {
                  const breakevenAno = calc.anos.find(
                    (a) => a.saldoAluguel >= 0
                  );
                  const totalAluguel = calc.anos.reduce(
                    (s, a) => s + a.aluguelAnual,
                    0
                  );
                  const totalParcelas = calc.anos.reduce(
                    (s, a) => s + a.parcelaAno,
                    0
                  );
                  const saldoTotal = totalAluguel - totalParcelas;
                  return (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns:
                          'repeat(auto-fit,minmax(160px,1fr))',
                        gap: 8,
                        marginTop: 4,
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 10, color: '#3a3a30' }}>
                          Breakeven (aluguel ≥ parcela)
                        </div>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: breakevenAno ? C.green : C.red,
                            fontFamily: 'monospace',
                          }}
                        >
                          {breakevenAno
                            ? `Ano ${breakevenAno.ano}`
                            : 'Nunca neste horizonte'}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: '#3a3a30' }}>
                          Total aluguel recebido
                        </div>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: C.green,
                            fontFamily: 'monospace',
                          }}
                        >
                          {short(totalAluguel)}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: '#3a3a30' }}>
                          Total parcelas pagas
                        </div>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: C.red,
                            fontFamily: 'monospace',
                          }}
                        >
                          {short(totalParcelas)}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: '#3a3a30' }}>
                          Saldo líquido aluguel − parcela
                        </div>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: saldoTotal >= 0 ? C.green : C.red,
                            fontFamily: 'monospace',
                          }}
                        >
                          {short(saldoTotal)}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Tabela */}
              <div style={{ overflowX: 'auto' }}>
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: 11,
                  }}
                >
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${C.line}` }}>
                      {[
                        'Ano',
                        'Parcela (início)',
                        'Amortização',
                        'Juros',
                        'Saldo Devedor',
                        'Aluguel',
                        'Saldo Mensal',
                        'Equity',
                      ].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: '7px 10px',
                            textAlign: 'right',
                            color: '#3a3830',
                            fontWeight: 600,
                            fontSize: 9,
                            letterSpacing: '0.4px',
                            whiteSpace: 'nowrap',
                            textTransform: 'uppercase',
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {calc.anos.map((a, i) => {
                      const isBreakeven =
                        i > 0 &&
                        calc.anos[i - 1].saldoAluguel < 0 &&
                        a.saldoAluguel >= 0;
                      const saldoPos = a.saldoAluguel >= 0;
                      return (
                        <tr
                          key={i}
                          style={{
                            borderBottom: `1px solid ${C.line}`,
                            background: isBreakeven
                              ? `${C.green}18`
                              : 'transparent',
                          }}
                        >
                          <td
                            style={{
                              padding: '7px 10px',
                              color: isBreakeven ? C.green : C.muted,
                              fontWeight: isBreakeven ? 700 : 400,
                            }}
                          >
                            {a.ano}
                            {isBreakeven ? ' ✦' : ''}
                          </td>
                          <td
                            style={{
                              padding: '7px 10px',
                              textAlign: 'right',
                              color: C.gold,
                              fontFamily: 'monospace',
                            }}
                          >
                            {brl(a.parcelaMes1)}
                          </td>
                          <td
                            style={{
                              padding: '7px 10px',
                              textAlign: 'right',
                              color: C.muted,
                              fontFamily: 'monospace',
                            }}
                          >
                            {brl(calc.amort)}
                          </td>
                          <td
                            style={{
                              padding: '7px 10px',
                              textAlign: 'right',
                              color: C.red,
                              fontFamily: 'monospace',
                            }}
                          >
                            {brl(a.parcelaMes1 - calc.amort)}
                          </td>
                          <td
                            style={{
                              padding: '7px 10px',
                              textAlign: 'right',
                              color: C.red,
                              fontFamily: 'monospace',
                            }}
                          >
                            {short(a.saldoDev)}
                          </td>
                          <td
                            style={{
                              padding: '7px 10px',
                              textAlign: 'right',
                              color: C.green,
                              fontFamily: 'monospace',
                            }}
                          >
                            {brl(aluguelMes)}
                          </td>
                          <td
                            style={{
                              padding: '7px 10px',
                              textAlign: 'right',
                              fontWeight: 700,
                              fontFamily: 'monospace',
                              color: saldoPos ? C.green : C.red,
                            }}
                          >
                            {saldoPos ? '+' : ''}
                            {brl(a.saldoAluguel)}
                          </td>
                          <td
                            style={{
                              padding: '7px 10px',
                              textAlign: 'right',
                              color: C.green,
                              fontFamily: 'monospace',
                            }}
                          >
                            {short(a.equity)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr
                      style={{
                        borderTop: `2px solid ${C.line}`,
                        background: '#0a0a07',
                      }}
                    >
                      <td
                        style={{
                          padding: '8px 10px',
                          color: C.gold,
                          fontWeight: 700,
                          fontSize: 10,
                        }}
                      >
                        TOTAL
                      </td>
                      <td
                        style={{
                          padding: '8px 10px',
                          textAlign: 'right',
                          color: C.red,
                          fontFamily: 'monospace',
                          fontWeight: 700,
                        }}
                      >
                        {short(
                          calc.anos.reduce((s, a) => s + a.parcelaAno, 0) /
                            (prazoAnos * 12)
                        )}
                        <span style={{ fontSize: 9, color: C.muted }}>
                          {' '}
                          /mês médio
                        </span>
                      </td>
                      <td
                        style={{
                          padding: '8px 10px',
                          textAlign: 'right',
                          color: C.muted,
                          fontFamily: 'monospace',
                        }}
                      >
                        {short(calc.financiado)}
                      </td>
                      <td
                        style={{
                          padding: '8px 10px',
                          textAlign: 'right',
                          color: C.red,
                          fontFamily: 'monospace',
                        }}
                      >
                        {short(calc.totalJuros)}
                      </td>
                      <td
                        style={{
                          padding: '8px 10px',
                          textAlign: 'right',
                          color: '#444',
                        }}
                      >
                        —
                      </td>
                      <td
                        style={{
                          padding: '8px 10px',
                          textAlign: 'right',
                          color: C.green,
                          fontFamily: 'monospace',
                        }}
                      >
                        {short(aluguelMes * 12 * prazoAnos)}
                      </td>
                      <td
                        style={{
                          padding: '8px 10px',
                          textAlign: 'right',
                          fontWeight: 700,
                          fontFamily: 'monospace',
                          color:
                            aluguelMes * 12 * prazoAnos -
                              calc.anos.reduce((s, a) => s + a.parcelaAno, 0) >=
                            0
                              ? C.green
                              : C.red,
                        }}
                      >
                        {short(
                          aluguelMes * 12 * prazoAnos -
                            calc.anos.reduce((s, a) => s + a.parcelaAno, 0)
                        )}
                      </td>
                      <td
                        style={{
                          padding: '8px 10px',
                          textAlign: 'right',
                          color: C.green,
                          fontFamily: 'monospace',
                        }}
                      >
                        {short(calc.valorFinal)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <div
                style={{
                  marginTop: 10,
                  fontSize: 10,
                  color: '#333328',
                  lineHeight: 1.6,
                }}
              >
                ✦ Linha destacada = primeiro ano em que o aluguel cobre a
                parcela SAC. Saldo mensal = aluguel − parcela (não inclui
                condomínio, IPTU ou manutenção).
              </div>
            </div>

            {/* Resumo total */}
            <div style={{ ...card({ marginTop: 12 }) }}>
              <div
                style={{
                  fontSize: 9,
                  letterSpacing: '3px',
                  color: C.gold,
                  textTransform: 'uppercase',
                  marginBottom: 12,
                }}
              >
                Ciclo Completo — {prazoAnos} Anos
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))',
                  gap: 8,
                }}
              >
                {[
                  [
                    'Entrada + custos aquisição',
                    calc.capitalTotal,
                    C.red,
                    'saída no dia 1',
                  ],
                  [
                    'Principal financiado',
                    calc.financiado,
                    C.red,
                    'devolvido ao banco',
                  ],
                  [
                    'Total de juros pagos',
                    calc.totalJuros,
                    C.red,
                    `média anual ${pct(
                      ((calc.totalJuros / calc.financiado) * 100) / prazoAnos
                    )}`,
                  ],
                  [
                    'Total condomínio',
                    calc.totalCondo,
                    C.muted,
                    `${prazoAnos}a × ${brl(condoMes)}/mês`,
                  ],
                  [
                    'Total IPTU',
                    calc.totalIptu,
                    C.muted,
                    `${prazoAnos}a × ${short(calc.iptuAnual)}/ano`,
                  ],
                  [
                    'Total manutenção',
                    calc.totalManut,
                    C.muted,
                    `${pct(manutPct)} a.a.`,
                  ],
                  [
                    'CUSTO TOTAL DE VIDA',
                    calc.custoTotalVida,
                    C.red,
                    'tudo somado',
                  ],
                  [
                    'Valor final do imóvel',
                    calc.valorFinal,
                    C.green,
                    `+${pct(valorizAA)} a.a.`,
                  ],
                  [
                    'Ganho líq. (após IR GC 15%)',
                    calc.ganhoLiqVenda - calc.custoTotalVida,
                    calc.ganhoLiqVenda > calc.custoTotalVida ? C.green : C.red,
                    'se vender ao fim do prazo',
                  ],
                ].map(([l, v, c, s]) => (
                  <div
                    key={l}
                    style={{
                      background: '#0d0d09',
                      border: `1px solid ${C.line}`,
                      borderRadius: 8,
                      padding: '12px 14px',
                    }}
                  >
                    <div
                      style={{ fontSize: 10, color: C.dim, marginBottom: 3 }}
                    >
                      {l}
                    </div>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: c,
                        fontFamily: 'monospace',
                      }}
                    >
                      {short(v)}
                    </div>
                    <div style={{ fontSize: 10, color: '#282820' }}>{s}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════ TAB CDI ══════════════ */}
        {tab === 'cdi' && (
          <div>
            <div
              style={{
                fontSize: 11,
                color: C.muted,
                marginBottom: 10,
                lineHeight: 1.8,
              }}
            >
              Investe o capital inicial{' '}
              <strong style={{ color: C.text }}>
                {short(calc.capitalTotal)}
              </strong>{' '}
              no CDI a{' '}
              <strong style={{ color: C.blue }}>
                {cdiPct}% do CDI ({pct((CDI_AA * cdiPct) / 100)} a.a.)
              </strong>
              . Aporta mensalmente os mesmos valores que seriam gastos no imóvel
              — parcela SAC exata de cada mês, condomínio e manutenção mensais,
              e IPTU uma vez por ano em janeiro. IR de 15% deduzido anualmente
              sobre os rendimentos de cada ano.
            </div>
            <div
              style={{
                marginBottom: 16,
                padding: '11px 14px',
                background: '#100e06',
                border: `1px solid ${C.gold}44`,
                borderRadius: 8,
                fontSize: 11,
                color: '#7a7050',
                lineHeight: 1.7,
              }}
            >
              ⚠️{' '}
              <strong style={{ color: C.gold }}>
                Leia antes de interpretar:
              </strong>{' '}
              O patrimônio final elevado reflete principalmente o{' '}
              <strong style={{ color: '#a89040' }}>
                efeito de juros compostos sobre aportes mensais altos (~
                {brl(calc.parcelaIni + condoMes + calc.manutMes)}/mês no ano 1)
              </strong>{' '}
              — valores que na prática você precisaria ter disponíveis todo mês.
              O CDI é mantido fixo em {pct((CDI_AA * cdiPct) / 100)} a.a. por{' '}
              {prazoAnos} anos, o que é improvável: a Selic média histórica
              desde 2000 é ~11% a.a. Use o slider para testar cenários mais
              conservadores.
            </div>

            {/* KPIs CDI ano selecionado */}
            {aCDI && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))',
                  gap: 8,
                  marginBottom: 14,
                }}
              >
                <KPI
                  label={`Patrimônio bruto — ano ${ano}`}
                  value={short(aCDI.patrimonioBruto)}
                  color={C.blue}
                />
                <KPI
                  label="IR estimado (15%)"
                  value={'−' + short(aCDI.ir)}
                  color={C.red}
                />
                <KPI
                  label="Patrimônio líquido"
                  value={short(aCDI.patrimonioLiq)}
                  color={C.blue}
                  highlight
                />
                <KPI
                  label="Renda mensal líquida"
                  value={brl(aCDI.rendaMensalLiq)}
                  color={C.green}
                  highlight
                  sub="sem tocar no principal"
                />
                <KPI
                  label="Total aportado"
                  value={short(aCDI.aportesAcum)}
                  color={C.muted}
                />
              </div>
            )}

            {/* seletor */}
            <div
              style={{
                display: 'flex',
                gap: 5,
                flexWrap: 'wrap',
                marginBottom: 14,
              }}
            >
              {[1, 5, 10, Math.round(prazoAnos / 2), prazoAnos]
                .filter((v, i, a) => a.indexOf(v) === i)
                .map((a) => (
                  <button
                    key={a}
                    onClick={() => setAnoViz(a)}
                    style={{
                      padding: '5px 13px',
                      borderRadius: 20,
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 11,
                      fontFamily: 'inherit',
                      background: anoViz === a ? C.blue : '#111108',
                      color: anoViz === a ? '#fff' : C.muted,
                      fontWeight: anoViz === a ? 700 : 400,
                    }}
                  >
                    {a === prazoAnos ? 'Final' : `Ano ${a}`}
                  </button>
                ))}
            </div>

            {/* Tabela */}
            <div style={card()}>
              <div
                style={{
                  fontSize: 9,
                  letterSpacing: '3px',
                  color: C.blue,
                  textTransform: 'uppercase',
                  marginBottom: 12,
                }}
              >
                Progressão Anual Completa
              </div>

              {/* mini chart */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: 2,
                  height: 80,
                  marginBottom: 10,
                  overflowX: 'auto',
                }}
              >
                {cdiCalc.anosCDI.map((a, i) => {
                  const maxV = Math.max(
                    ...cdiCalc.anosCDI.map((x) => x.patrimonioLiq)
                  );
                  const maxR = Math.max(
                    ...cdiCalc.anosCDI.map((x) => x.rendaMensalLiq)
                  );
                  return (
                    <div
                      key={i}
                      onClick={() => setAnoViz(i + 1)}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'flex-end',
                        height: 78,
                        gap: 1,
                        cursor: 'pointer',
                        minWidth: 12,
                      }}
                    >
                      <div
                        style={{
                          flex: 1,
                          background: anoViz === i + 1 ? C.blue : `${C.blue}55`,
                          borderRadius: '2px 2px 0 0',
                          height: `${(a.patrimonioLiq / maxV) * 100}%`,
                          minHeight: 2,
                        }}
                      />
                      <div
                        style={{
                          flex: 1,
                          background:
                            anoViz === i + 1 ? C.green : `${C.green}55`,
                          borderRadius: '2px 2px 0 0',
                          height: `${(a.rendaMensalLiq / maxR) * 100}%`,
                          minHeight: 2,
                        }}
                      />
                    </div>
                  );
                })}
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: 14,
                  fontSize: 10,
                  color: C.muted,
                  marginBottom: 12,
                }}
              >
                <span>
                  <span
                    style={{
                      display: 'inline-block',
                      width: 9,
                      height: 9,
                      background: C.blue,
                      borderRadius: 2,
                      marginRight: 4,
                    }}
                  />
                  Patrimônio líquido
                </span>
                <span>
                  <span
                    style={{
                      display: 'inline-block',
                      width: 9,
                      height: 9,
                      background: C.green,
                      borderRadius: 2,
                      marginRight: 4,
                    }}
                  />
                  Renda mensal líquida
                </span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: 11,
                  }}
                >
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${C.line}` }}>
                      {[
                        'Ano',
                        'Aporte/mês',
                        'Patr. Bruto',
                        'IR 15%',
                        'Patr. Líquido',
                        'Renda Mensal Líq.',
                      ].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: '6px 10px',
                            textAlign: 'right',
                            color: '#3a3a30',
                            fontWeight: 'normal',
                            fontSize: 9,
                            letterSpacing: '0.5px',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cdiCalc.anosCDI.map((a, i) => (
                      <tr
                        key={i}
                        onClick={() => setAnoViz(i + 1)}
                        style={{
                          borderBottom: `1px solid ${C.line}`,
                          background:
                            anoViz === i + 1 ? `${C.blue}14` : 'transparent',
                          cursor: 'pointer',
                        }}
                      >
                        <td
                          style={{
                            padding: '7px 10px',
                            color: anoViz === i + 1 ? C.blue : C.muted,
                            fontWeight: 700,
                          }}
                        >
                          {a.ano}
                        </td>
                        <td
                          style={{
                            padding: '7px 10px',
                            textAlign: 'right',
                            color: '#444',
                            fontFamily: 'monospace',
                          }}
                        >
                          {brl(a.aporte)}
                        </td>
                        <td
                          style={{
                            padding: '7px 10px',
                            textAlign: 'right',
                            color: '#aaa',
                            fontFamily: 'monospace',
                          }}
                        >
                          {short(a.patrimonioBruto)}
                        </td>
                        <td
                          style={{
                            padding: '7px 10px',
                            textAlign: 'right',
                            color: C.red,
                            fontFamily: 'monospace',
                          }}
                        >
                          −{short(a.ir)}
                        </td>
                        <td
                          style={{
                            padding: '7px 10px',
                            textAlign: 'right',
                            color: C.blue,
                            fontWeight: 700,
                            fontFamily: 'monospace',
                          }}
                        >
                          {short(a.patrimonioLiq)}
                        </td>
                        <td
                          style={{
                            padding: '7px 10px',
                            textAlign: 'right',
                            color: C.green,
                            fontWeight: 700,
                            fontFamily: 'monospace',
                          }}
                        >
                          {brl(a.rendaMensalLiq)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* DISCLAIMER */}
        <div
          style={{
            marginTop: 14,
            background: '#08080a',
            border: `1px solid ${C.line}`,
            borderRadius: 10,
            padding: 12,
          }}
        >
          <div style={{ fontSize: 10, color: '#33332a', lineHeight: 1.7 }}>
            ⚠️ Simulação educacional com premissas simplificadas. Não considera
            inflação, variação do CDI ao longo do tempo, vacância imobiliária ou
            mudanças tributárias. Consulte um assessor financeiro certificado
            (CFP) antes de tomar decisões de investimento.
          </div>
        </div>
      </div>
    </div>
  );
}
