import { useMemo, useState } from 'react'
import './App.css'

type ScenarioYear = {
  year: number
  propertyValue: number
  propertyWealth: number
  propertyWealthAfterTax: number
  debt: number
  installment: number
  interestPaid: number
  investedWealth: number
  investedIncome: number
  investedGross: number
  incomeTax: number
  investedContributions: number
}

const CDI_AA = 13.25

const money = (value: number, digits = 0) =>
  Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })

const percent = (value: number, digits = 1) =>
  `${Number(value || 0).toFixed(digits).replace('.', ',')}%`

const compactMoney = (value: number) => {
  const n = Number(value || 0)
  const abs = Math.abs(n)
  const sign = n < 0 ? '-' : ''

  if (abs >= 1_000_000) return `${sign}R$ ${(abs / 1_000_000).toFixed(2).replace('.', ',')} mi`
  if (abs >= 1_000) return `${sign}R$ ${(abs / 1_000).toFixed(0)} mil`
  return money(n)
}

function Slider({
  label,
  helper,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string
  helper?: string
  value: number
  min: number
  max: number
  step: number
  format: (value: number) => string
  onChange: (value: number) => void
}) {
  const progress = ((value - min) / (max - min)) * 100

  return (
    <label className="slider">
      <span className="slider__top">
        <span>
          <span className="slider__label">{label}</span>
          {helper && <span className="slider__helper">{helper}</span>}
        </span>
        <strong>{format(value)}</strong>
      </span>
      <span className="slider__track" style={{ '--progress': `${progress}%` } as React.CSSProperties}>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
        />
      </span>
    </label>
  )
}

function Metric({
  label,
  value,
  helper,
  tone = 'neutral',
}: {
  label: string
  value: string
  helper?: string
  tone?: 'neutral' | 'property' | 'investment' | 'good' | 'bad'
}) {
  return (
    <div className={`metric metric--${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {helper && <small>{helper}</small>}
    </div>
  )
}

function ComparisonChart({ data }: { data: ScenarioYear[] }) {
  const width = 920
  const height = 300
  const padX = 58
  const padTop = 24
  const padBottom = 42
  const innerW = width - padX * 2
  const innerH = height - padTop - padBottom
  const maxY = Math.max(...data.map((item) => Math.max(item.propertyWealthAfterTax, item.investedWealth)), 1)
  const x = (index: number) => padX + (index / Math.max(data.length - 1, 1)) * innerW
  const y = (value: number) => padTop + innerH - (Math.max(value, 0) / maxY) * innerH
  const path = (key: 'propertyWealthAfterTax' | 'investedWealth') =>
    data.map((item, index) => `${index === 0 ? 'M' : 'L'} ${x(index).toFixed(1)} ${y(item[key]).toFixed(1)}`).join(' ')
  const grid = [0, 0.25, 0.5, 0.75, 1].map((step) => maxY * step)

  return (
    <div className="chart" aria-label="Comparação da evolução patrimonial">
      <svg viewBox={`0 0 ${width} ${height}`} role="img">
        <defs>
          <linearGradient id="propertyFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#2f6f73" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#2f6f73" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="investmentFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#755cdb" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#755cdb" stopOpacity="0" />
          </linearGradient>
        </defs>

        {grid.map((value) => (
          <g key={value}>
            <line x1={padX} x2={width - padX} y1={y(value)} y2={y(value)} />
            <text x={padX - 10} y={y(value) + 4} textAnchor="end">
              {compactMoney(value)}
            </text>
          </g>
        ))}

        {data
          .filter((_, index) => index === 0 || index === data.length - 1 || index % 5 === 0)
          .map((item, index) => {
            const realIndex = data.indexOf(item)
            return (
              <text key={`${item.year}-${index}`} x={x(realIndex)} y={height - 12} textAnchor="middle">
                {item.year === 0 ? 'Hoje' : `${item.year}a`}
              </text>
            )
          })}

        <path
          className="chart__area chart__area--property"
          d={`${path('propertyWealthAfterTax')} L ${x(data.length - 1)} ${padTop + innerH} L ${padX} ${padTop + innerH} Z`}
        />
        <path
          className="chart__area chart__area--investment"
          d={`${path('investedWealth')} L ${x(data.length - 1)} ${padTop + innerH} L ${padX} ${padTop + innerH} Z`}
        />
        <path className="chart__line chart__line--property" d={path('propertyWealthAfterTax')} />
        <path className="chart__line chart__line--investment" d={path('investedWealth')} />
      </svg>
      <div className="legend">
        <span><i className="legend__property" /> Compra do imóvel</span>
        <span><i className="legend__investment" /> Aplicação financeira</span>
      </div>
    </div>
  )
}

export default function App() {
  const [price, setPrice] = useState(1_400_000)
  const [downPaymentPct, setDownPaymentPct] = useState(20)
  const [financingRate, setFinancingRate] = useState(10)
  const [years, setYears] = useState(20)
  const [appreciationRate, setAppreciationRate] = useState(6)
  const [cdiPct, setCdiPct] = useState(100)
  const [condo, setCondo] = useState(1500)
  const [maintenancePct, setMaintenancePct] = useState(0.5)
  const [rent, setRent] = useState(7000)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [activeTab, setActiveTab] = useState<'summary' | 'details' | 'cashflow'>('summary')

  const simulation = useMemo(() => {
    const downPayment = price * (downPaymentPct / 100)
    const financed = price - downPayment
    const transferTax = price * 0.03
    const brokerage = price * 0.06
    const registry = price * 0.015
    const purchaseCosts = transferTax + brokerage + registry
    const initialCash = downPayment + purchaseCosts
    const monthlyFinancingRate = Math.pow(1 + financingRate / 100, 1 / 12) - 1
    const months = years * 12
    const monthlyAmortization = financed / months
    const yearlyPropertyTax = price * 0.007
    const monthlyMaintenance = (price * maintenancePct) / 100 / 12
    const monthlyCdiRate = Math.pow(1 + (CDI_AA * cdiPct) / 100 / 100, 1 / 12) - 1

    let debt = financed
    let propertyValue = price
    let investedWealth = initialCash
    let investedContributions = initialCash
    let totalInterestPaid = 0
    const rows: ScenarioYear[] = [
      {
        year: 0,
        propertyValue: price,
        propertyWealth: downPayment,
        propertyWealthAfterTax: initialCash,
        debt: financed,
        installment: 0,
        interestPaid: 0,
        investedWealth: initialCash,
        investedIncome: initialCash * monthlyCdiRate * 0.85,
        investedGross: initialCash,
        incomeTax: 0,
        investedContributions: initialCash,
      },
    ]

    for (let year = 1; year <= years; year += 1) {
      let installmentYear = 0
      let interestYear = 0
      let contributionYear = 0
      let incomeTax = 0

      for (let month = 0; month < 12; month += 1) {
        const interest = debt * monthlyFinancingRate
        const installment = monthlyAmortization + interest
        debt = Math.max(debt - monthlyAmortization, 0)

        const monthlyContribution = installment + condo + monthlyMaintenance
        investedWealth += monthlyContribution
        investedContributions += monthlyContribution
        contributionYear += monthlyContribution

        if (month === 0) {
          investedWealth += yearlyPropertyTax
          investedContributions += yearlyPropertyTax
          contributionYear += yearlyPropertyTax
        }

        const grossReturn = investedWealth * monthlyCdiRate
        const tax = grossReturn * 0.15
        investedWealth += grossReturn - tax
        incomeTax += tax

        installmentYear += installment
        interestYear += interest
      }

      totalInterestPaid += interestYear
      propertyValue *= 1 + appreciationRate / 100
      const capitalGainTax = Math.max(propertyValue - price, 0) * 0.15
      const propertyWealth = propertyValue - debt

      rows.push({
        year,
        propertyValue,
        propertyWealth,
        propertyWealthAfterTax: propertyValue - debt - capitalGainTax,
        debt,
        installment: installmentYear / 12,
        interestPaid: totalInterestPaid,
        investedWealth,
        investedIncome: investedWealth * monthlyCdiRate * 0.85,
        investedGross: investedWealth + incomeTax,
        incomeTax,
        investedContributions,
      })
    }

    const final = rows[rows.length - 1]
    const firstInstallment = rows[1]?.installment ?? 0

    return {
      downPayment,
      financed,
      transferTax,
      brokerage,
      registry,
      purchaseCosts,
      initialCash,
      monthlyMaintenance,
      yearlyPropertyTax,
      firstInstallment,
      rows,
      final,
      monthlyCdiRate,
      yearlyCdiRate: (CDI_AA * cdiPct) / 100,
      totalInterestPaid,
      monthlyCarryingCost: firstInstallment + condo + monthlyMaintenance + yearlyPropertyTax / 12,
      rentBalance: rent - condo - yearlyPropertyTax / 12 - monthlyMaintenance,
    }
  }, [appreciationRate, cdiPct, condo, downPaymentPct, financingRate, maintenancePct, price, rent, years])

  const difference = simulation.final.investedWealth - simulation.final.propertyWealthAfterTax
  const winner = difference >= 0 ? 'investment' : 'property'
  const breakEven = simulation.rows.find(
    (row) => row.year > 0 && row.propertyWealthAfterTax >= row.investedWealth,
  )

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <span className="eyebrow">Comparador de investimentos</span>
          <h1>Comprar um imóvel ou investir o dinheiro?</h1>
          <p>
            Compare, em linguagem simples, o dinheiro que sai do bolso na compra de um imóvel
            com uma aplicação financeira atrelada ao CDI.
          </p>
        </div>
        <div className="hero__result">
          <span>Resultado no fim de {years} anos</span>
          <strong className={winner === 'investment' ? 'is-investment' : 'is-property'}>
            {winner === 'investment' ? 'Aplicação financeira à frente' : 'Compra do imóvel à frente'}
          </strong>
          <small>Diferença estimada de {compactMoney(Math.abs(difference))}</small>
        </div>
      </section>

      <section className="layout">
        <aside className="controls-panel">
          <div className="panel-heading">
            <span className="eyebrow">Entradas</span>
            <h2>Dados principais</h2>
            <p>Comece por estes campos. Eles explicam quase toda a comparação.</p>
          </div>

          <Slider
            label="Preço do imóvel"
            value={price}
            min={300_000}
            max={5_000_000}
            step={50_000}
            format={(value) => money(value)}
            onChange={setPrice}
          />
          <Slider
            label="Entrada"
            helper="Percentual pago no início"
            value={downPaymentPct}
            min={5}
            max={80}
            step={5}
            format={(value) => percent(value, 0)}
            onChange={setDownPaymentPct}
          />
          <Slider
            label="Juros do financiamento"
            value={financingRate}
            min={6}
            max={16}
            step={0.25}
            format={(value) => `${percent(value)} ao ano`}
            onChange={setFinancingRate}
          />
          <Slider
            label="Prazo da comparação"
            value={years}
            min={5}
            max={35}
            step={1}
            format={(value) => `${value} anos`}
            onChange={setYears}
          />
          <Slider
            label="Rendimento da aplicação"
            helper={`CDI de referência: ${percent(CDI_AA)} ao ano`}
            value={cdiPct}
            min={60}
            max={130}
            step={5}
            format={(value) => `${value}% do CDI`}
            onChange={setCdiPct}
          />

          <button className="advanced-toggle" type="button" onClick={() => setShowAdvanced((current) => !current)}>
            {showAdvanced ? 'Ocultar ajustes avançados' : 'Mostrar ajustes avançados'}
          </button>

          {showAdvanced && (
            <div className="advanced-panel">
              <Slider
                label="Valorização do imóvel"
                value={appreciationRate}
                min={0}
                max={14}
                step={0.5}
                format={(value) => `${percent(value)} ao ano`}
                onChange={setAppreciationRate}
              />
              <Slider
                label="Condomínio"
                value={condo}
                min={0}
                max={6000}
                step={100}
                format={(value) => money(value)}
                onChange={setCondo}
              />
              <Slider
                label="Manutenção"
                helper="Estimativa anual sobre o valor do imóvel"
                value={maintenancePct}
                min={0}
                max={2}
                step={0.1}
                format={(value) => `${percent(value)} ao ano`}
                onChange={setMaintenancePct}
              />
              <Slider
                label="Aluguel possível"
                helper="Usado apenas na leitura de fluxo mensal"
                value={rent}
                min={0}
                max={25_000}
                step={250}
                format={(value) => money(value)}
                onChange={setRent}
              />
            </div>
          )}
        </aside>

        <section className="results">
          <div className="summary-grid">
            <Metric
              label="Dinheiro inicial comparado"
              value={money(simulation.initialCash)}
              helper="Entrada mais custos de compra. A aplicação começa com o mesmo valor."
            />
            <Metric
              label="Primeira parcela estimada"
              value={money(simulation.firstInstallment)}
              helper="Sistema SAC: a parcela cai com o tempo."
              tone="property"
            />
            <Metric
              label="Aplicação no final"
              value={compactMoney(simulation.final.investedWealth)}
              helper={`${percent(simulation.yearlyCdiRate)} ao ano, líquido de IR estimado.`}
              tone="investment"
            />
            <Metric
              label="Imóvel no final"
              value={compactMoney(simulation.final.propertyWealthAfterTax)}
              helper="Valor do imóvel menos dívida e imposto estimado de venda."
              tone="property"
            />
          </div>

          <div className="content-card content-card--chart">
            <div className="section-title">
              <span className="eyebrow">Evolução</span>
              <h2>Patrimônio estimado ao longo do tempo</h2>
              <p>
                O gráfico compara dois caminhos usando o mesmo esforço financeiro: comprar o imóvel
                ou investir o valor inicial e os gastos mensais equivalentes.
              </p>
            </div>
            <ComparisonChart data={simulation.rows} />
          </div>

          <div className="tabs" role="tablist" aria-label="Detalhes da simulação">
            {[
              ['summary', 'Leitura rápida'],
              ['details', 'Custos da compra'],
              ['cashflow', 'Ano a ano'],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={activeTab === key ? 'is-active' : ''}
                onClick={() => setActiveTab(key as typeof activeTab)}
              >
                {label}
              </button>
            ))}
          </div>

          {activeTab === 'summary' && (
            <div className="content-card readable">
              <h2>Como ler o resultado</h2>
              <p>
                A simulação não tenta dizer que uma opção é sempre melhor. Ela mostra quanto patrimônio
                você teria em cada caminho se as taxas escolhidas permanecessem iguais durante o prazo.
              </p>
              <div className="explain-grid">
                <div>
                  <strong>Compra do imóvel</strong>
                  <p>
                    Considera entrada, custos de aquisição, financiamento, condomínio, IPTU,
                    manutenção, valorização do imóvel e imposto estimado se houver venda.
                  </p>
                </div>
                <div>
                  <strong>Aplicação financeira</strong>
                  <p>
                    Começa com o mesmo dinheiro inicial da compra e recebe, mês a mês, os valores
                    que seriam gastos com o imóvel.
                  </p>
                </div>
              </div>
              <p>
                {breakEven
                  ? `Neste cenário, o imóvel passa a aplicação por volta do ano ${breakEven.year}.`
                  : `Neste cenário, a aplicação fica à frente durante todo o período de ${years} anos.`}
              </p>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="content-card">
              <div className="section-title">
                <span className="eyebrow">Compra</span>
                <h2>Quanto sai do bolso no início</h2>
              </div>
              <div className="cost-list">
                <div><span>Entrada</span><strong>{money(simulation.downPayment)}</strong></div>
                <div><span>ITBI estimado</span><strong>{money(simulation.transferTax)}</strong></div>
                <div><span>Corretagem estimada</span><strong>{money(simulation.brokerage)}</strong></div>
                <div><span>Cartório e registro</span><strong>{money(simulation.registry)}</strong></div>
                <div className="is-total"><span>Total inicial</span><strong>{money(simulation.initialCash)}</strong></div>
              </div>
              <div className="note">
                A aplicação financeira começa exatamente com esse mesmo total inicial para a comparação
                ficar equilibrada.
              </div>
            </div>
          )}

          {activeTab === 'cashflow' && (
            <div className="content-card">
              <div className="section-title">
                <span className="eyebrow">Tabela</span>
                <h2>Evolução ano a ano</h2>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Ano</th>
                      <th>Imóvel</th>
                      <th>Aplicação</th>
                      <th>Dívida</th>
                      <th>Parcela média</th>
                      <th>Renda mensal da aplicação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {simulation.rows
                      .filter((row) => row.year > 0)
                      .map((row) => (
                        <tr key={row.year}>
                          <td>{row.year}</td>
                          <td>{compactMoney(row.propertyWealthAfterTax)}</td>
                          <td>{compactMoney(row.investedWealth)}</td>
                          <td>{compactMoney(row.debt)}</td>
                          <td>{money(row.installment)}</td>
                          <td>{money(row.investedIncome)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <p className="disclaimer">
            Simulação educacional com hipóteses simplificadas. Não considera inflação,
            mudanças futuras no CDI, vacância, reformas extraordinárias ou alterações tributárias.
          </p>
        </section>
      </section>
    </main>
  )
}
