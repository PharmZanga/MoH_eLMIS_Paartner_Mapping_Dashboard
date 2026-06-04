import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const partners = [
  { name: "USAID GHSC-PSM", type: "Bilateral", support: ["Financial", "Technical", "Training"], modules: ["Requisitions", "Order approval", "Analytics"], role: "Requisition approver", provinces: ["Lusaka", "Copperbelt", "Southern", "Eastern"], products: ["HIV", "Malaria", "Essential medicines"], committed: 5200000, disbursed: 4100000, compliance: 91, facilities: 462, status: "Active", endDate: "2026-09-30", focal: "MoH LMU / USAID", contact: "moh-lmu@example.gov.zm", phone: "+260 000 000 001", lastActivity: "2026-05-24" },
  { name: "Global Fund", type: "Multilateral", support: ["Financial", "Governance"], modules: ["Analytics", "Reporting", "Master data"], role: "Data viewer", provinces: ["Lusaka", "Copperbelt", "North-Western", "Western"], products: ["HIV", "TB", "Malaria"], committed: 4800000, disbursed: 3500000, compliance: 87, facilities: 388, status: "Active", endDate: "2027-03-31", focal: "MoH Grants Unit", contact: "grants@example.gov.zm", phone: "+260 000 000 002", lastActivity: "2026-05-18" },
  { name: "UNICEF", type: "Multilateral", support: ["Technical", "Training", "Commodities"], modules: ["Inventory", "Reporting", "Facility support"], role: "Trainer", provinces: ["Luapula", "Northern", "Muchinga", "Eastern"], products: ["Vaccines", "Nutrition", "Child health"], committed: 2100000, disbursed: 1600000, compliance: 94, facilities: 274, status: "Active", endDate: "2026-12-15", focal: "EPI Programme", contact: "epi@example.gov.zm", phone: "+260 000 000 003", lastActivity: "2026-05-27" },
  { name: "CHAI", type: "NGO", support: ["Technical", "Analytics"], modules: ["Analytics", "Interoperability", "Dashboards"], role: "System admin", provinces: ["Lusaka", "Central", "Southern"], products: ["HIV", "Maternal health"], committed: 1250000, disbursed: 1010000, compliance: 82, facilities: 195, status: "Active", endDate: "2026-08-20", focal: "Digital Health Unit", contact: "digitalhealth@example.gov.zm", phone: "+260 000 000 004", lastActivity: "2026-05-14" },
  { name: "JICA", type: "Bilateral", support: ["Infrastructure", "Training"], modules: ["Warehouse", "Order approval", "Inventory"], role: "Warehouse mentor", provinces: ["Lusaka", "Copperbelt"], products: ["Essential medicines", "Lab commodities"], committed: 1850000, disbursed: 910000, compliance: 73, facilities: 88, status: "At-risk", endDate: "2026-07-31", focal: "ZAMMSA Operations", contact: "operations@example.gov.zm", phone: "+260 000 000 005", lastActivity: "2026-04-29" },
  { name: "World Bank", type: "Multilateral", support: ["Financial", "Governance"], modules: ["Master data", "Reporting"], role: "Accountable owner", provinces: ["National"], products: ["All programmes"], committed: 3300000, disbursed: 2500000, compliance: 89, facilities: 0, status: "Active", endDate: "2027-06-30", focal: "MoH Planning", contact: "planning@example.gov.zm", phone: "+260 000 000 006", lastActivity: "2026-05-21" },
  { name: "Crown Agents", type: "Private", support: ["Technical", "Infrastructure"], modules: ["Warehouse", "Integration support"], role: "Consulted specialist", provinces: ["Lusaka", "Central"], products: ["Procurement", "Warehousing"], committed: 760000, disbursed: 760000, compliance: 97, facilities: 42, status: "Completed", endDate: "2026-05-31", focal: "ZAMMSA ICT", contact: "ict@example.gov.zm", phone: "+260 000 000 007", lastActivity: "2026-05-30" },
  { name: "PATH", type: "NGO", support: ["Training", "Analytics"], modules: ["Facility support", "Reporting"], role: "Trainer", provinces: ["Western", "Southern", "Eastern"], products: ["Vaccines", "Malaria"], committed: 940000, disbursed: 510000, compliance: 78, facilities: 214, status: "Planned", endDate: "2027-01-15", focal: "EPI Programme", contact: "epi-path@example.gov.zm", phone: "+260 000 000 008", lastActivity: "2026-05-03" }
];

const provinces = ["Central", "Copperbelt", "Eastern", "Luapula", "Lusaka", "Muchinga", "Northern", "North-Western", "Southern", "Western"];
const supportFilters = ["All", "Financial", "Technical", "Training", "Commodities", "Infrastructure", "Governance", "Analytics"];
const moduleRows = ["Requisitions", "Order approval", "Inventory", "Reporting", "Analytics", "Warehouse", "Master data", "Interoperability", "Facility support"];
const pages = [
  ["overview", "Overview"],
  ["partners", "Partners"],
  ["mapping", "Mapping"],
  ["modules", "eLMIS roles"],
  ["funding", "Funding"],
  ["performance", "Performance"],
  ["contacts", "Contacts"]
];

function money(value) {
  return `$${(value / 1000000).toFixed(value >= 1000000 ? 1 : 2)}M`;
}

function daysTo(dateString) {
  const today = new Date("2026-06-04T00:00:00");
  const end = new Date(`${dateString}T00:00:00`);
  return Math.ceil((end - today) / 86400000);
}

function downloadCsv(rows) {
  const headers = ["Partner", "Type", "Status", "Support", "Modules", "Role", "Provinces", "Products", "Committed", "Disbursed", "Compliance", "Facilities", "End Date", "Focal Person", "Last Activity"];
  const csvRows = rows.map((p) => [
    p.name, p.type, p.status, p.support.join("; "), p.modules.join("; "), p.role, p.provinces.join("; "), p.products.join("; "),
    p.committed, p.disbursed, p.compliance, p.facilities, p.endDate, p.focal, p.lastActivity
  ]);
  const csv = [headers, ...csvRows]
    .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "elmis-partner-mapping-report.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function App() {
  const [page, setPage] = useState("overview");
  const [supportFilter, setSupportFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [query, setQuery] = useState("");

  const visiblePartners = useMemo(() => {
    return partners.filter((partner) => {
      const matchesSupport = supportFilter === "All" || partner.support.includes(supportFilter);
      const matchesStatus = statusFilter === "All" || partner.status === statusFilter;
      const haystack = [partner.name, partner.type, partner.role, partner.focal, partner.contact, ...partner.modules, ...partner.provinces, ...partner.products].join(" ").toLowerCase();
      return matchesSupport && matchesStatus && haystack.includes(query.toLowerCase());
    });
  }, [supportFilter, statusFilter, query]);

  const totals = useMemo(() => {
    const committed = visiblePartners.reduce((sum, p) => sum + p.committed, 0);
    const disbursed = visiblePartners.reduce((sum, p) => sum + p.disbursed, 0);
    const facilities = visiblePartners.reduce((sum, p) => sum + p.facilities, 0);
    const expiring = visiblePartners.filter((p) => daysTo(p.endDate) <= 120).length;
    const compliance = Math.round(visiblePartners.reduce((sum, p) => sum + p.compliance, 0) / visiblePartners.length || 0);
    return { committed, disbursed, facilities, expiring, compliance };
  }, [visiblePartners]);

  function showExpiringSoon() {
    setStatusFilter("All");
    setSupportFilter("All");
    setQuery("");
    setPage("performance");
  }

  return (
    <main className="dashboard-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Ministry of Health Zambia</p>
          <h1>eLMIS Partner Mapping Dashboard</h1>
          <p className="subtitle">Operational view of partner coverage, eLMIS roles, funding execution, performance, contacts, and expiring agreements.</p>
        </div>
        <div className="actions">
          <button type="button" onClick={() => downloadCsv(visiblePartners)}>Export report</button>
          <button type="button" className="alert-button" onClick={showExpiringSoon}>{totals.expiring} expiring soon</button>
        </div>
      </header>

      <nav className="page-nav" aria-label="Dashboard pages">
        {pages.map(([id, label]) => (
          <button type="button" key={id} className={page === id ? "active" : ""} onClick={() => setPage(id)}>{label}</button>
        ))}
      </nav>

      <Filters
        query={query}
        setQuery={setQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        supportFilter={supportFilter}
        setSupportFilter={setSupportFilter}
      />

      <section className="kpi-grid" aria-label="Summary KPIs">
        <Kpi label="Mapped partners" value={visiblePartners.length} detail={`${visiblePartners.filter((p) => p.status === "Active").length} active`} />
        <Kpi label="Committed funding" value={money(totals.committed)} detail={`${money(totals.disbursed)} disbursed`} />
        <Kpi label="Facilities assigned" value={totals.facilities.toLocaleString()} detail="Excludes national-only support" />
        <Kpi label="Average compliance" value={`${totals.compliance}%`} detail="Deliverables and reporting" />
      </section>

      {page === "overview" && <Overview partners={visiblePartners} />}
      {page === "partners" && <PartnersPage partners={visiblePartners} />}
      {page === "mapping" && <MappingPage partners={visiblePartners} />}
      {page === "modules" && <ModulesPage partners={visiblePartners} />}
      {page === "funding" && <FundingPage partners={visiblePartners} />}
      {page === "performance" && <PerformancePage partners={visiblePartners} />}
      {page === "contacts" && <ContactsPage partners={visiblePartners} />}
    </main>
  );
}

function Filters({ query, setQuery, statusFilter, setStatusFilter, supportFilter, setSupportFilter }) {
  return (
    <section className="filter-band" aria-label="Dashboard filters">
      <label>
        <span>Search</span>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Partner, province, module, focal person" />
      </label>
      <label>
        <span>Status</span>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          {["All", "Active", "Planned", "At-risk", "Completed"].map((status) => <option key={status}>{status}</option>)}
        </select>
      </label>
      <div className="segmented" role="group" aria-label="Support type">
        {supportFilters.map((filter) => (
          <button type="button" key={filter} className={filter === supportFilter ? "selected" : ""} onClick={() => setSupportFilter(filter)}>
            {filter}
          </button>
        ))}
      </div>
    </section>
  );
}

function Overview({ partners }) {
  return (
    <>
      <section className="layout-grid">
        <MapPanel partners={partners} />
        <FundingBars partners={partners.slice(0, 6)} />
      </section>
      <section className="layout-grid wide-left">
        <ModuleMatrix partners={partners} />
        <RiskPanel partners={partners} />
      </section>
      <DirectoryTable partners={partners} title="Partner directory" />
    </>
  );
}

function PartnersPage({ partners }) {
  const byType = ["Bilateral", "Multilateral", "NGO", "Private"].map((type) => ({ type, count: partners.filter((p) => p.type === type).length }));
  return (
    <section className="layout-grid wide-left">
      <DirectoryTable partners={partners} title="Partner registry" />
      <div className="panel">
        <PanelTitle eyebrow="Partner mix" title="Partner count by type" />
        <div className="stat-list">{byType.map((item) => <StatRow key={item.type} label={item.type} value={item.count} />)}</div>
      </div>
    </section>
  );
}

function MappingPage({ partners }) {
  return (
    <section className="layout-grid wide-left">
      <MapPanel partners={partners} />
      <div className="panel">
        <PanelTitle eyebrow="Province detail" title="Coverage by province" />
        <div className="stat-list">
          {provinceCoverage(partners).map(({ province, count, facilities }) => <StatRow key={province} label={province} value={`${count} partners`} detail={`${facilities} facilities`} />)}
        </div>
      </div>
    </section>
  );
}

function ModulesPage({ partners }) {
  return (
    <section className="layout-grid wide-left">
      <ModuleMatrix partners={partners} />
      <div className="panel">
        <PanelTitle eyebrow="Coverage gaps" title="Modules needing ownership" />
        <div className="risk-list">
          {moduleRows.map((module) => ({ module, owners: partners.filter((p) => p.modules.includes(module)) }))
            .filter(({ owners }) => owners.length === 0)
            .map(({ module }) => <div className="risk-item" key={module}><strong>{module}</strong><b className="risk-high">Gap</b></div>)}
          {moduleRows.every((module) => partners.some((p) => p.modules.includes(module))) && <p className="empty-note">All core eLMIS modules have at least one mapped partner.</p>}
        </div>
      </div>
    </section>
  );
}

function FundingPage({ partners }) {
  return (
    <section className="layout-grid wide-left">
      <FundingBars partners={partners} />
      <div className="panel">
        <PanelTitle eyebrow="Agreement tracking" title="Funding execution table" />
        <CompactTable
          headers={["Partner", "Committed", "Disbursed", "Rate", "End date"]}
          rows={partners.map((p) => [p.name, money(p.committed), money(p.disbursed), `${Math.round((p.disbursed / p.committed) * 100)}%`, p.endDate])}
        />
      </div>
    </section>
  );
}

function PerformancePage({ partners }) {
  const watchList = partners.filter((p) => daysTo(p.endDate) <= 180 || p.compliance < 80 || p.status === "At-risk");
  return (
    <section className="layout-grid wide-left">
      <div className="panel">
        <PanelTitle eyebrow="Performance" title="Compliance and last activity" />
        <CompactTable
          headers={["Partner", "Compliance", "Status", "Last activity", "Days to end"]}
          rows={partners.map((p) => [p.name, `${p.compliance}%`, p.status, p.lastActivity, daysTo(p.endDate)])}
        />
      </div>
      <RiskPanel partners={watchList.length ? watchList : partners} />
    </section>
  );
}

function ContactsPage({ partners }) {
  return (
    <section className="panel directory-panel">
      <PanelTitle eyebrow="Operational contacts" title="Focal persons and follow-up details" />
      <CompactTable
        headers={["Partner", "Focal person / unit", "Email", "Phone", "Role", "Last activity"]}
        rows={partners.map((p) => [p.name, p.focal, p.contact, p.phone, p.role, p.lastActivity])}
      />
    </section>
  );
}

function MapPanel({ partners }) {
  return (
    <div className="panel map-panel">
      <PanelTitle eyebrow="Geographic mapping" title="Partner density by province" aside="Partners covering province" />
      <div className="province-map">
        {provinceCoverage(partners).map(({ province, count }) => (
          <div className={`province level-${Math.min(count, 5)}`} key={province}>
            <span>{province}</span>
            <strong>{count}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function provinceCoverage(rows) {
  return provinces.map((province) => {
    const covering = rows.filter((p) => p.provinces.includes(province) || p.provinces.includes("National"));
    return { province, count: covering.length, facilities: covering.reduce((sum, p) => sum + p.facilities, 0) };
  });
}

function FundingBars({ partners }) {
  return (
    <div className="panel">
      <PanelTitle eyebrow="Funding execution" title="Committed vs disbursed" />
      <div className="funding-bars">
        {partners.map((partner) => (
          <div className="funding-row" key={partner.name}>
            <div className="funding-label"><span>{partner.name}</span><strong>{money(partner.committed)}</strong></div>
            <div className="bar-track">
              <span className="bar-committed" style={{ width: "100%" }} />
              <span className="bar-disbursed" style={{ width: `${Math.round((partner.disbursed / partner.committed) * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ModuleMatrix({ partners }) {
  return (
    <div className="panel">
      <PanelTitle eyebrow="Functional mapping" title="eLMIS module and RACI view" />
      <div className="module-matrix">
        <div className="matrix-header">Module</div>
        <div className="matrix-header">Partners</div>
        <div className="matrix-header">Primary role</div>
        {moduleRows.map((module) => {
          const owners = partners.filter((partner) => partner.modules.includes(module));
          return (
            <React.Fragment key={module}>
              <div className="matrix-module">{module}</div>
              <div className="chips">{owners.length ? owners.map((p) => <span key={p.name}>{p.name}</span>) : <em>Coverage gap</em>}</div>
              <div>{owners[0]?.role || "Assign owner"}</div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

function RiskPanel({ partners }) {
  return (
    <div className="panel">
      <PanelTitle eyebrow="Risk register" title="Renewals and performance" />
      <div className="risk-list">
        {partners
          .filter((p) => daysTo(p.endDate) <= 180 || p.compliance < 80 || p.status === "At-risk")
          .map((p) => (
            <div className="risk-item" key={p.name}>
              <div><strong>{p.name}</strong><span>{p.status} · ends {p.endDate}</span></div>
              <b className={p.compliance < 80 ? "risk-high" : "risk-watch"}>{p.compliance}%</b>
            </div>
          ))}
      </div>
    </div>
  );
}

function DirectoryTable({ partners, title }) {
  return (
    <section className="panel directory-panel">
      <PanelTitle eyebrow="Partner directory" title={title} />
      <div className="table-wrap">
        <table>
          <thead><tr><th>Partner</th><th>Type</th><th>Support</th><th>eLMIS role</th><th>Coverage</th><th>Funding</th><th>Status</th><th>End date</th><th>Focal person</th></tr></thead>
          <tbody>{partners.map((p) => (
            <tr key={p.name}>
              <td><strong>{p.name}</strong><span>{p.products.join(", ")}</span></td>
              <td>{p.type}</td>
              <td>{p.support.join(", ")}</td>
              <td>{p.role}</td>
              <td>{p.provinces.join(", ")}<span>{p.facilities || "National"} facilities</span></td>
              <td>{money(p.disbursed)}<span>of {money(p.committed)}</span></td>
              <td><StatusPill status={p.status} /></td>
              <td>{p.endDate}<span>{daysTo(p.endDate)} days</span></td>
              <td>{p.focal}<span>Last activity {p.lastActivity}</span></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </section>
  );
}

function CompactTable({ headers, rows }) {
  return (
    <div className="table-wrap compact">
      <table>
        <thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead>
        <tbody>{rows.map((row, index) => <tr key={`${row[0]}-${index}`}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

function StatRow({ label, value, detail }) {
  return <div className="stat-row"><span>{label}{detail ? <small>{detail}</small> : null}</span><strong>{value}</strong></div>;
}

function PanelTitle({ eyebrow, title, aside }) {
  return (
    <div className="panel-heading">
      <div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div>
      {aside ? <span className="legend">{aside}</span> : null}
    </div>
  );
}

function Kpi({ label, value, detail }) {
  return <article className="kpi-card"><span>{label}</span><strong>{value}</strong><p>{detail}</p></article>;
}

function StatusPill({ status }) {
  return <span className={`status status-${status.toLowerCase().replace("-", "")}`}>{status}</span>;
}

createRoot(document.getElementById("root")).render(<App />);
